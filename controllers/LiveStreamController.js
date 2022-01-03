const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const LiveStreamChannel = require('../models/LiveStreamChannel');
const LiveStreamJoinUser = require('../models/LiveStreamJoinUser');
const User = require('../models/User');
const {getAge, getDistance} = require('../helper/commonHelpers');
const LiveStreamResource = require('../controllers/resources/LiveStreamResource');
const LiveSticker = require('../models/LiveSticker');
const UserDiamond = require('../models/UserDiamond');
const UserCredit = require('../models/UserCredit');
const LiveStreamFavoriteUser = require('../models/LiveStreamFavoriteUser');
const {PushNotification} = require('../helper/PushNotification');
const UserSettingNotification = require('../models/UserSettingNotification');

exports.storeLiveStreamUser = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsChannelId = await LiveStreamChannel.findOne({channel_id: req.body.channel_id});

		if (existsChannelId && String(existsChannelId.user_id) != String(req.user._id)) { 
				//if existed channel and user_id is different
			return res.send(response.error(400, 'channel id already used to other user', [] ));
		} else if(existsChannelId) {
			await LiveStreamChannel.findOneAndUpdate({user_id: req.user._id}, {
					channel_id: req.body.channel_id,
					status: 1,
					current_stream_diamonds_count: 0,
					current_stream_viewers_count: 0,
					current_stream_likes_count: 0
				},{new:true,runValidators:true});
		} else {
			const existsUserChannelId = await LiveStreamChannel.findOne({user_id: req.user._id});
			if (existsUserChannelId) {
				await LiveStreamChannel.findOneAndUpdate({user_id: req.user._id}, {
						channel_id: req.body.channel_id,
						status: 1,
						current_stream_diamonds_count: 0,
						current_stream_viewers_count: 0,
						current_stream_likes_count: 0
					},{new:true,runValidators:true});
			} else {
				const LiveStreamChannelData = new LiveStreamChannel({
					channel_id: req.body.channel_id,
					user_id: req.user._id,
				});
				await LiveStreamChannelData.save();
			}
		}

		let LiveStreamFavoriteChannelData = await LiveStreamFavoriteUser.find({channel_id: req.body.channel_id});
		let FavoriteChannelUserIds = [...new Set(LiveStreamFavoriteChannelData.map(item => String(item.user_id)))]; //get only user_ids in array object

		const longitude = parseFloat(req.user.location.coordinates[0]);
		const latitude = parseFloat(req.user.location.coordinates[1]);
		let userList = await User.aggregate([ {
				$geoNear: {
					"near": {
						"type": "Point",
						"coordinates": [longitude, latitude]
					},
					"maxDistance": 1609 * 100, //km
					"spherical": true,
					"distanceField": "distance",
					"distanceMultiplier": 0.001
				}
			},{
				$match: {_id: {$ne: req.user._id}}
			},
			// { $limit: 50 },
		]);

		let UserIds = userList.map(function(i) { return String(i._id) }); //get only user ids

		const UserSettingNotificationData = await UserSettingNotification.find({user_id: {$in: UserIds}, notification_id: '61a8b514214fb23c58039297', status: 1}).lean(); //Live Video Nearby
		let NotificationSettingOnUser = UserSettingNotificationData.map(function(i) { return String(i.user_id) }); //get only user ids
		UserIds = NotificationSettingOnUser;

		//for favorite user channel
		const UserSettingNotificationData2 = await UserSettingNotification.find({user_id: {$in: FavoriteChannelUserIds}, notification_id: '61a8b5565d7f830fd465d7ae', status: 0}).lean(); //Live Video My favorites
		let NotificationSettingOffUser2 = UserSettingNotificationData2.map(function(i) { return String(i.user_id) }); //get only user ids
		FavoriteChannelUserIds = UserIds.filter(value => !NotificationSettingOffUser2.includes(value)); //removed Notification Setting Off User

		UserIds = UserIds.concat(FavoriteChannelUserIds); //merge Array favorite user ids and near by user ids
		UserIds = UserIds.filter((e, i, a) => a.indexOf(e) === i) //filter and remove duplicate user ids

		//send push notification for Live Video Nearby
		let sender_id = req.user._id;
		let receiver_id = UserIds;
		let notification_title = req.user.name+ ' live now!';
		let notification_body = '';

		let data = await PushNotification(sender_id, receiver_id, notification_title, notification_body);
		if (data.error) return res.send(response.success(400, data.error, []));

		//delete all last join user data
		await LiveStreamJoinUser.deleteMany({channel_id: req.body.channel_id});

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.updateLiveStreamUser = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let LiveStreamChannelData = await LiveStreamChannel.findOneAndUpdate({channel_id: req.body.channel_id, user_id: req.user._id}, {status: 1}, {new:true,runValidators:true}).populate({path:'user_id', select: ['name','birth_date','profile_image','diamonds_value','language']}).lean();
		if (!LiveStreamChannelData) return res.send(response.error(400, 'Live stream channel not found', []));

		LiveStreamChannelData.user_id = {
			_id: LiveStreamChannelData.user_id._id,
			name: LiveStreamChannelData.user_id.name,
			profile_image: LiveStreamChannelData.user_id.profile_image ? LiveStreamChannelData.user_id.profile_image : '',
			diamonds_value: LiveStreamChannelData.user_id.diamonds_value ? LiveStreamChannelData.user_id.diamonds_value : 0,
			age: LiveStreamChannelData.user_id.birth_date ? getAge(LiveStreamChannelData.user_id.birth_date) : 0,
		}

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.removeLiveSteamUserStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let LiveStreamChannelData = await LiveStreamChannel.findOneAndUpdate({channel_id: req.body.channel_id, user_id: req.user._id}, {status: 0}, {new:true,runValidators:true});
		if (!LiveStreamChannelData) return res.send(response.error(400, 'Live stream channel not found', []));

		return res.send(response.success(200, 'Success', [LiveStreamChannelData] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.storeJoinLiveStreamUser = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const LiveStreamChannelData = await LiveStreamChannel.findOne({ channel_id: req.body.channel_id, status: 1}).lean();
		if (!LiveStreamChannelData) return res.send(response.error(400, 'live channel not found', [] ));

		const JoinUser = await LiveStreamJoinUser.findOne({channel_id: req.body.channel_id, user_id: req.user._id});
		if (JoinUser){
			await LiveStreamJoinUser.findOneAndUpdate({channel_id: req.body.channel_id, user_id: req.user._id}, {status: 1}, {new:true,runValidators:true});
		} else {
			const LiveStreamJoinUserData = await LiveStreamJoinUser.create({
				live_channel_id: LiveStreamChannelData._id,
				channel_id: req.body.channel_id,
				user_id: req.user._id,
			});

			await LiveStreamChannel.findOneAndUpdate({channel_id: req.body.channel_id, status: 1}, {$inc: {current_stream_viewers_count: 1}}, {new:true,runValidators:true});
		}		

		return res.send(response.success(200, 'user join successfully', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.getJoinLiveStreamUserList = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const LiveStreamChannelData = await LiveStreamChannel.findOne({ channel_id: req.body.channel_id, status: 1}).lean();
		if (!LiveStreamChannelData) return res.send(response.error(400, 'channel is not live', [] ));

		const JoinUser = await LiveStreamJoinUser.find({channel_id: req.body.channel_id, status: 1});

		return res.send(response.success(200, 'Success', JoinUser ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.removeJoinLiveStreamUser = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const JoinUser = await LiveStreamJoinUser.findOneAndUpdate({channel_id: req.body.channel_id, user_id: req.user._id}, {status: 0}, {new:true,runValidators:true});
		if (!JoinUser) return res.send(response.error(400, 'user not found', [] ));

		return res.send(response.success(200, 'Success', [JoinUser] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.sendLiveStreamLike = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let LiveStreamChannelData = await LiveStreamChannel.findOneAndUpdate({channel_id: req.body.channel_id}, {$inc : {current_stream_likes_count : 1}}, {new:true,runValidators:true});
		if (!LiveStreamChannelData) return res.send(response.error(400, 'Live stream channel not found', []));

		return res.send(response.success(200, 'Success', LiveStreamChannelData ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.sendLiveStreamSticker = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
			sticker_id: Joi.objectId().label('sticker id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let LiveStickerData = await LiveSticker.findOne({_id: req.body.sticker_id, status: 1});
		if (!LiveStickerData) return res.send(response.error(400, 'sticker not found', [] ));

		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		if (!userData) return res.send(response.error(400, 'user not found', [] ));
		if (userData.credits_value == undefined || userData.credits_value <= LiveStickerData.sticker_value) {
			return res.send(response.error(400, 'insufficient credit balance', [] ));
		}

		const LiveStreamChannelData = await LiveStreamChannel.findOneAndUpdate({ channel_id: req.body.channel_id}, 
				{$inc: {current_stream_diamonds_count: parseInt(LiveStickerData.sticker_value)} }, 
				{new:true,runValidators:true});
		if (!LiveStreamChannelData) return res.send(response.error(400, 'channel is not found', [] ));

		//minus credits in login user(sender account)
		const UserCreditData = new UserCredit({
			user_id: req.user._id,
			title: "live stream send sticker",
			ref_user_id: LiveStreamChannelData.user_id,
			debit_credit_status: 0, //(-)
			credits_value: LiveStickerData.sticker_value
		});
		await UserCreditData.save();
		let loginUserData = await User.findOneAndUpdate({_id: req.user._id}, {$inc : {credits_value: -Math.abs(LiveStickerData.sticker_value)}}, {new:true,runValidators:true}); //-Math.abs() user for transfer negative number
		if (!loginUserData) return res.send(response.error(400, 'user not found', []));

		//plus diamonds in live user(receiver account)
		const UserDiamondData = new UserDiamond({
			user_id: LiveStreamChannelData.user_id,
			title: "live stream receive stickers",
			ref_user_id: req.user._id,
			debit_credit_status: 1, //(+)
			diamonds_value: LiveStickerData.sticker_value
		});
		await UserDiamondData.save();
		let LiveUserData = await User.findOneAndUpdate({_id: LiveStreamChannelData.user_id}, {$inc : {diamonds_value : parseInt(LiveStickerData.sticker_value)}}, {new:true,runValidators:true});
		if (!LiveUserData) return res.send(response.error(400, 'user not found', []));

		return res.send(response.success(200, 'Success', LiveStreamChannelData ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.changeLiveStreamFavoriteStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let existsData = await LiveStreamFavoriteUser.findOne({user_id: req.user._id, channel_id: req.body.channel_id});
		if (existsData) {
			await LiveStreamFavoriteUser.deleteOne({user_id: req.user._id, channel_id: req.body.channel_id});
		} else {
			const LiveStreamFavoriteUserData = new LiveStreamFavoriteUser({
				user_id: req.user._id,
				channel_id: req.body.channel_id,
			});
			await LiveStreamFavoriteUserData.save();
		}

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.getLiveStreamUserList = async (req,res) => {
	try {
		const schema = Joi.object({
			interest: Joi.number().label('interest').allow('',null).valid(1,2,3),
			location: Joi.string().trim(true).allow('',null).label('location'),
			language_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let findArrayObject = { status: 1 }; //for filter user
		if (req.body.interest == 1 || req.body.interest == 2) {
			findArrayObject.gender = req.body.interest;
		}
		if (req.body.location) {
			// findArrayObject.hometown = req.body.location;
		}
		if (req.body.language_id) {
			findArrayObject.language = {$in: [req.body.language_id]}
		}

		const LiveStreamChannelData = await LiveStreamChannel.find({ user_id: { $ne: req.user._id }, status: 1}).populate({path:'user_id', match: findArrayObject, select: ['name','birth_date','profile_image','diamonds_value','language']}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1); 
				i--;
			} else {
				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0,
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.getSingleLiveStreamUserData = async (req,res) => {
	try {
		const schema = Joi.object({
			channel_id: Joi.string().trim(true).required().label('channel_id'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const LiveStreamChannelData = await LiveStreamChannel.findOne({ channel_id: req.body.channel_id, user_id: {$ne: req.user._id}, status: 1}).populate({path:'user_id', select: ['name','birth_date','profile_image','diamonds_value','language']}).lean();
		if (!LiveStreamChannelData) return res.send(response.error(400, 'Live stream channel not found', []));

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.findOne({channel_id: req.body.channel_id, user_id: req.user._id}); //get user favorite channel
		if (LiveStreamFavoriteUserData) {
			LiveStreamChannelData.favorite_status = 1;
		} else {
			LiveStreamChannelData.favorite_status = 0;
		}

		LiveStreamChannelData.user_id = {
			_id: LiveStreamChannelData.user_id._id,
			name: LiveStreamChannelData.user_id.name,
			profile_image: LiveStreamChannelData.user_id.profile_image ? LiveStreamChannelData.user_id.profile_image : '',
			diamonds_value: LiveStreamChannelData.user_id.diamonds_value ? LiveStreamChannelData.user_id.diamonds_value : 0,
			age: LiveStreamChannelData.user_id.birth_date ? getAge(LiveStreamChannelData.user_id.birth_date) : 0,
		}

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.favoriteLiveStreamUserList = async (req,res) => {
	try {
		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id});
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		const LiveStreamChannelData = await LiveStreamChannel.find({channel_id: {$in: channelIds}, user_id: {$ne: req.user._id}, status: 1}).populate({path:'user_id', match: {status: 1}, select: ['name','birth_date','profile_image','diamonds_value']}).lean();

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0
				}
			}
			element.favorite_status = 1;
		}

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.trendingLiveStreamChannelList = async (req,res) => { //shorting by current_stream_viewers_count
	try { 
		const schema = Joi.object({
			interest: Joi.number().label('interest').allow('',null).valid(1,2,3),
			location: Joi.string().trim(true).allow('',null).label('location'),
			language_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));
		
		let findArrayObject = { status: 1 }; //for filter user
		if (req.body.interest == 1 || req.body.interest == 2) {
			findArrayObject.gender = req.body.interest;
		}
		if (req.body.location) {
			// findArrayObject.hometown = req.body.location;
		}
		if (req.body.language_id) {
			findArrayObject.language = {$in: [req.body.language_id]}
		}

		const LiveStreamChannelData = await LiveStreamChannel.find({ user_id: { $ne: req.user._id }, status: 1}).sort({current_stream_viewers_count: -1}).populate({path:'user_id', match: findArrayObject, select: ['name','birth_date','profile_image','diamonds_value']}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0
				}
			}
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.nearbyUserLiveStreamChannelList = async (req,res) => {
	try {
		const schema = Joi.object({
			interest: Joi.number().label('interest').allow('',null).valid(1,2,3),
			location: Joi.string().trim(true).allow('',null).label('location'),
			language_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));
		
		let findArrayObject = { status: 1 }; //for filter user
		if (req.body.interest == 1 || req.body.interest == 2) {
			findArrayObject.gender = req.body.interest;
		}
		if (req.body.location) {
			// findArrayObject.hometown = req.body.location;
		}
		if (req.body.language_id) {
			findArrayObject.language = {$in: [req.body.language_id]}
		}

		let LiveStreamChannelData = await LiveStreamChannel.find({ user_id: {$ne: req.user._id}, status: 1}).populate({path:'user_id', match: findArrayObject, select: ['name','birth_date','profile_image','diamonds_value','location']}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		const userLongitude = parseFloat(req.user.location.coordinates[0]);
		const userLatitude = parseFloat(req.user.location.coordinates[1]);

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					location: element.user_id.location ? element.user_id.location : {},
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0
				}

				if (element.user_id.location == 'undefined') {
					LiveStreamChannelData.splice(i, 1);
					i--;
				} else {
					const streamUserLongitude = parseFloat(element.user_id.location.coordinates[0]);
					const streamUserLatitude = parseFloat(element.user_id.location.coordinates[1]);
					const distance = getDistance(userLatitude, userLongitude, streamUserLatitude, streamUserLongitude);
					element.distance = distance ? distance : 0;
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		LiveStreamChannelData.sort((a,b) => a - b); //sorting nearest first

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.newUserLiveStreamChannelList = async (req,res) => {
	try {
		const schema = Joi.object({
			interest: Joi.number().label('interest').allow('',null).valid(1,2,3),
			location: Joi.string().trim(true).allow('',null).label('location'),
			language_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));
		
		let findArrayObject = { status: 1 }; //for filter user
		if (req.body.interest == 1 || req.body.interest == 2) {
			findArrayObject.gender = req.body.interest;
		}
		if (req.body.location) {
			// findArrayObject.hometown = req.body.location;
		}
		if (req.body.language_id) {
			findArrayObject.language = {$in: [req.body.language_id]}
		}

		let LiveStreamChannelData = await LiveStreamChannel.find({ user_id: {$ne: req.user._id}, status: 1}).populate({path:'user_id', match: findArrayObject, select: ['+created_at']}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				let startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()); //get date before one month
				let endDate = new Date();
				let checkDate = element.user_id.created_at;
				if(startDate >= checkDate || endDate <= checkDate){
					LiveStreamChannelData.splice(i, 1);
					i--;
				}

				element.user_created_at = element.user_id.created_at;

				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		LiveStreamChannelData.sort((a,b) =>  new Date(b.user_created_at) - new Date(a.user_created_at)); //sorting latest first

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.totalTopDiamondUserLiveStreamChannelList = async (req,res) => {
	try {
		let LiveStreamChannelData = await LiveStreamChannel.find({ user_id: {$ne: req.user._id}}).populate({path:'user_id', match: {status: 1}}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		LiveStreamChannelData.sort((a,b) => b.user_id.diamonds_value - a.user_id.diamonds_value); //sorting top diamonds first

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.liveNowTopDiamondUserLiveStreamChannelList = async (req,res) => {
	try {
		let LiveStreamChannelData = await LiveStreamChannel.find({ user_id: {$ne: req.user._id}, status: 1}).populate({path:'user_id', match: {status: 1}}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					diamonds_value: element.user_id.diamonds_value ? element.user_id.diamonds_value : 0,
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		LiveStreamChannelData.sort((a,b) => b.user_id.diamonds_value - a.user_id.diamonds_value); //sorting top diamonds first

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.todayTopDiamondUserLiveStreamChannelList = async (req,res) => {
	try {
		let UserDiamondData = await UserDiamond.aggregate([
			{
				$match: {
					"created_at": { $gt: new Date(Date.now() - 24*60*60 * 1000) } //24 hours
				},
			},{
				$group: {
					"_id": "$user_id",
					"total_diamonds": { 
						"$sum": "$diamonds_value"
					} 
				}
			}
		]);

		let UserDiamondDataUserIds = UserDiamondData.map(function(i) { return i._id }); //get only user ids

		let LiveStreamChannelData = await LiveStreamChannel.find({user_id: {$in: UserDiamondDataUserIds}}).populate({path:'user_id', match: {status: 1}}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				let findUserDiamondData = UserDiamondData.find(o => String(o._id) == String(element.user_id._id));

				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0,
					diamonds_value: findUserDiamondData.total_diamonds ? findUserDiamondData.total_diamonds : 0,
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		LiveStreamChannelData.sort((a,b) => b.user_id.diamonds_value - a.user_id.diamonds_value); //sorting top diamonds first

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.weekTopDiamondUserLiveStreamChannelList = async (req,res) => {
	try {
		let UserDiamondData = await UserDiamond.aggregate([
			{
				$match: {
					"created_at": { $gt: new Date(Date.now() - 7*24*60*60 * 1000) }
				},
			},{
				$group: {
					"_id": "$user_id",
					"total_diamonds": { 
						"$sum": "$diamonds_value"
					} 
				}
			}
		]);

		let UserDiamondDataUserIds = UserDiamondData.map(function(i) { return i._id }); //get only user ids

		let LiveStreamChannelData = await LiveStreamChannel.find({user_id: {$in: UserDiamondDataUserIds}}).populate({path:'user_id', match: {status: 1}}).lean();

		let LiveStreamFavoriteUserData = await LiveStreamFavoriteUser.find({user_id: req.user._id}); //get user favorite channel list
		let channelIds = [...new Set(LiveStreamFavoriteUserData.map(item => item.channel_id))]; //get only channel_id in array object

		for (let i = 0; i < LiveStreamChannelData.length; i++) {
			const element = LiveStreamChannelData[i];
			if (element.user_id == null) {
				LiveStreamChannelData.splice(i, 1);
				i--;
			} else {
				let findUserDiamondData = UserDiamondData.find(o => String(o._id) == String(element.user_id._id));

				element.user_id = {
					_id: element.user_id._id,
					name: element.user_id.name,
					profile_image: element.user_id.profile_image ? element.user_id.profile_image : '',
					age: element.user_id.birth_date ? getAge(element.user_id.birth_date) : 0,
					diamonds_value: findUserDiamondData.total_diamonds ? findUserDiamondData.total_diamonds : 0,
				}
			}
			
			const favoriteChannelExists = channelIds.includes(element.channel_id);
			if (favoriteChannelExists) {
				element.favorite_status = 1;
			}
		}

		LiveStreamChannelData.sort((a,b) => b.user_id.diamonds_value - a.user_id.diamonds_value); //sorting top diamonds first

		return res.send(response.success(200, 'Success', LiveStreamResource(LiveStreamChannelData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}