const response = require("../helper/response");
const console = require("../helper/console");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const UserResource = require('./resources/UserResource');
const User = require("../models/User");
const MatchedUsers = require("../models/MatchedUsers");
const MatchedPopupMessage = require("../models/MatchedPopupMessage");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const {PushNotification} = require('../helper/PushNotification');
const UserSettingNotification = require('../models/UserSettingNotification');

exports.matchingUserList = async (req,res) => {
	try {
		if (!req.user.hasOwnProperty('location')) {
			return res.send(response.error(400, 'User location not exists', []));
		}

		const longitude = parseFloat(req.user.location.coordinates[0]);
		const latitude = parseFloat(req.user.location.coordinates[1]);

		const MatchedUsersList = await MatchedUsers.find({user_id : req.user._id});
		let MatchedUsersArray = [ObjectId(req.user._id)];
		let SuperLikedUsersArray = [];
		MatchedUsersList.forEach(element => {
			if (element.super_like_status == 1) {
				SuperLikedUsersArray.push(String(element.matched_user_id));
			}else{
				MatchedUsersArray.push(ObjectId(element.matched_user_id));
			}
		});

		let matchArrayObject = {
			_id: { "$nin": MatchedUsersArray },
			status: 1 //exclude inactive user data
		}

		if (req.user.interest == 1 || req.user.interest == 2) {
			matchArrayObject.gender = req.user.interest;
		}

		let userList = await User.aggregate([ {
				$geoNear: {
					"near": {
						"type": "Point",
						"coordinates": [longitude, latitude]
					},
					"spherical": true,
					"distanceField": "distance",
					"distanceMultiplier": 0.001
				}
			},{
				$match: matchArrayObject
			},
			{ $limit: 150 },
		]);
		
		userList = JSON.parse(JSON.stringify(userList));
		let matchCount;

		for (let i = 0; i < userList.length; i++) {
			const user = userList[i];
			matchCount = 0;
			let matchDetails = ['language','hometown','occupation','edu_qualification','relationship_status','smoking','height'];
			matchDetails.forEach(element => {
				if (element == 'language') {
					
				} else if (user.hasOwnProperty(element) && req.user.hasOwnProperty(element)){
					if (user[element].toString().toLowerCase() == req.user[element].toString().toLowerCase()) {
						matchCount++;
					}
				}
			});
			userList[i].matchCount = matchCount; //temporary add field

			// if matching user already super liked then status show actives
			const result = SuperLikedUsersArray.includes(String(user._id));
			if (result) {
				userList[i].super_like_status = 1;
			} else {
				userList[i].super_like_status = 0;
			}
		}
		userList.sort((a, b) => (a.matchCount < b.matchCount) ? 1 : -1); //highest match count first in array

		return res.send(response.success(200, 'Success', UserResource(userList) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.filteredMatchingUserList = async (req,res) => {
	try {
		if (!req.user.hasOwnProperty('location')) {
			return res.send(response.error(400, 'User location not exists', []));
		}
		const longitude = parseFloat(req.user.location.coordinates[0]);
		const latitude = parseFloat(req.user.location.coordinates[1]);

		const MatchedUsersList = await MatchedUsers.find({user_id : req.user._id});
		let MatchedUsersArray = [ObjectId(req.user._id)];
		let SuperLikedUsersArray = [];
		MatchedUsersList.forEach(element => {
			if (element.super_like_status == 1) {
				SuperLikedUsersArray.push(String(element.matched_user_id));
			} else {
				MatchedUsersArray.push(ObjectId(element.matched_user_id));
			}
		});

		let matchArrayObject = {
			_id: { "$nin": MatchedUsersArray },
			status: 1 //exclude inactive user data
		}

		if (req.body.age_min != "" && req.body.age_max != "" && typeof req.body.age_min != "undefined" && typeof req.body.age_max != "undefined") {
			const minAgeDate = new Date(new Date().setFullYear(new Date().getFullYear() - req.body.age_min));
			const maxAgeDate = new Date(new Date().setFullYear(new Date().getFullYear() - req.body.age_max));
			matchArrayObject.birth_date = { $lt: minAgeDate, $gt: maxAgeDate}
		}

		if (req.body.height != "" && typeof req.body.height != "undefined") {
			req.body.height = req.body.height == 0 ? 0.1 : req.body.height;
			matchArrayObject.height = { $lt: parseFloat(req.body.height)}
		}

		if (req.body.filter_by != "" && typeof req.body.filter_by !== "undefined") { //1=all, 2=online, 3=new
			switch (req.body.filter_by) {
				case '2': //online
					matchArrayObject.online_status = 1;
					break;
				case '3': //new
					matchArrayObject.created_at = {$gt: new Date(Date.now() - 7*24*60*60*1000)}; //days*24*60*60*1000, default last 7 days created user filter
					break;
				default:
					break;
			}
		}

		if (req.body.show_me != "" && typeof req.body.show_me !== "undefined") {
			switch (req.body.show_me) {
				case '1': //male
					matchArrayObject.gender = parseInt(req.body.show_me);
					break;
				case '2': //female
					matchArrayObject.gender = parseInt(req.body.show_me);
					break;
				default:
					break;
			}
		}

		if (req.body.location != "" && typeof req.body.location !== "undefined") {
			// location => by hometown name
			matchArrayObject.hometown = req.body.location
		}

		if (req.body.relationship_status != "" && typeof req.body.relationship_status !== "undefined") {
			switch (req.body.relationship_status) {
				case '1':
					matchArrayObject.relationship_status = parseInt(req.body.relationship_status);
					break;
				case '2':
					matchArrayObject.relationship_status = parseInt(req.body.relationship_status);
					break;
				case '3':
					matchArrayObject.relationship_status = parseInt(req.body.relationship_status);
					break;
				default:
					break;
			}
		}

		let userList = await User.aggregate([ {
				$geoNear: {
					"near": {
						"type": "Point",
						"coordinates": [longitude, latitude]
					},
					"spherical": true,
					"distanceField": "distance",
					"distanceMultiplier": 0.001
				}
			},{
				$match: matchArrayObject
			},
			{ $limit: 150 },
		]);

		userList = JSON.parse(JSON.stringify(userList));
		let matchCount;

		for (let i = 0; i < userList.length; i++) {
			const user = userList[i];
			matchCount = 0;

			let matchDetails = ['language','hometown','occupation','edu_qualification','relationship_status','smoking','height'];
			matchDetails.forEach(element => {
				if (user.hasOwnProperty(element) && req.user.hasOwnProperty(element)){
					if (user[element].toString().toLowerCase() == req.user[element].toString().toLowerCase()) {
						matchCount++;
					}
				}
			});
			userList[i].matchCount = matchCount; //temporary add field

			// if matching user already super liked then status show actives
			const result = SuperLikedUsersArray.includes(String(user._id));
			if (result) {
				userList[i].super_like_status = 1;
			} else {
				userList[i].super_like_status = 0;
			}
		}
		userList.sort((a, b) => (a.matchCount < b.matchCount) ? 1 : -1); //highest match count first in array

		return res.send(response.success(200, 'Success', UserResource(userList) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.matchedUserStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			matched_user_id: Joi.string().required().label('Matched user id'),
			like_unlike_status: Joi.number().label('Like unlike status'),
			super_like_status: Joi.number().label('Super like status'),
			report_status: Joi.number().label('Report status'),
			block_status: Joi.number().label('Block status'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		if (req.body.like_unlike_status == undefined && req.body.super_like_status == undefined && req.body.report_status == undefined && req.body.block_status == undefined) {
			return res.send(response.error(400, 'like status is required', []));
		}

		if (String(req.user._id) == String(req.body.matched_user_id)) {
			return res.send(response.error(400, 'invalid user', []));
		}

		let MatchedUserData;
		let MatchedUserExists = await MatchedUsers.findOne({user_id: req.user._id, matched_user_id: req.body.matched_user_id});
		if (MatchedUserExists) {
			// already matched status stored
			MatchedUserData = await MatchedUsers.findOneAndUpdate({user_id: req.user._id, matched_user_id: req.body.matched_user_id}, {
					like_unlike_status: req.body.like_unlike_status,
					super_like_status: req.body.super_like_status,
					report_status: req.body.report_status ? req.body.report_status : 0,
					block_status: req.body.block_status ? req.body.block_status : 0,
				}, {new:true,runValidators:true});
		} else {
			const MatchedUser = new MatchedUsers({
				user_id: req.user._id,
				matched_user_id: req.body.matched_user_id,
				like_unlike_status: req.body.like_unlike_status,
				super_like_status: req.body.super_like_status,
				report_status: req.body.report_status ? req.body.report_status : 0,
				block_status: req.body.block_status ? req.body.block_status : 0,
			});
			MatchedUserData = await MatchedUser.save();
		}

		if (req.body.report_status == 1) {
			return res.send(response.success(200, 'user reported successfully', [] ));
		} else if(req.body.block_status == 1){
			return res.send(response.success(200, 'user blocked successfully', [] ));
		}

		// match user already liked your profile
		let MatchedUser = await MatchedUsers.findOne({user_id: req.body.matched_user_id, matched_user_id: req.user._id, like_unlike_status: 1, block_status: {$ne: 1}});
		if (MatchedUser) {
			if (MatchedUser.like_unlike_status == 1) {
				let MatchedPopupMessageData = new MatchedPopupMessage({
					user_id: req.user._id,
					matched_user_id: req.body.matched_user_id, //sending popup user id
					read_status: 0,
				});
				MatchedPopupMessageData = await MatchedPopupMessageData.save();

				//send push notification for matches
				let receiver_id = req.body.matched_user_id;
				let notification_title = 'You got a new match!';
				let notification_body = 'matched user' + receiver_id;
				const UserSettingNotificationData = await UserSettingNotification.findOne({user_id: receiver_id, notification_id: '61a8b4bd48ad09388cb51d48', status: 0}); //Matches
				if (!UserSettingNotificationData) {			
					let data = await PushNotification(req.user._id, receiver_id, notification_title, notification_body);
					if (data.error) return res.send(response.success(400, data.error, []));
				}

				return res.send(response.success(200, 'Match status store successfully', {matched: '1', message: 'its matched'} ));	
			}
		} else {
			//send push notification for likes
			let receiver_id = req.body.matched_user_id;
			let notification_title = 'Someone likes your profile!';
			let notification_body = '';
			const UserSettingNotificationData = await UserSettingNotification.findOne({user_id: receiver_id, notification_id: '61a8b4ce48ad09388cb51d4b', status: 0}); //likes
			if (!UserSettingNotificationData) {			
				let data = await PushNotification(req.user._id, receiver_id, notification_title, notification_body);
				if (data.error) return res.send(response.success(400, data.error, []));
			}
		}

		return res.send(response.success(200, 'Match status store successfully', {matched: '0', message: 'only liked'} ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.matchedUserList = async (req,res) => {
	try {
		let MatchedUsersList = await MatchedUsers.find({user_id: req.user._id, like_unlike_status: 1, block_status: {$ne: 1}}).populate({path: 'matched_user_id', match: {status: 1}}).lean();

		for (let i = 0; i < MatchedUsersList.length; i++) {
			const element = MatchedUsersList[i];
			if (element.matched_user_id == null) {
				MatchedUsersList.splice(i, 1);
				i--;
			}
		}

		// let MatchedUsersData = Object.values(MatchedUsersList.reduce( (acc,cur) => Object.assign(acc, { [cur.matched_user_id.toString()] : cur.matched_user_id } ), {} ) );
		let MatchedUsersData = MatchedUsersList.map(function(i) { return i.matched_user_id });

		return res.send(response.success(200, 'Success', UserResource(MatchedUsersData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.matchedPopupShow = async (req,res) => {
	try {
		let MatchedPopupMessageData = await MatchedPopupMessage.findOne({matched_user_id: req.user._id}).populate({path: 'user_id', match: {status: 1}}).sort({created_at: -1}).lean();

		if (MatchedPopupMessageData && MatchedPopupMessageData.read_status == 0) {
			MatchedPopupMessageData.read_status = String(MatchedPopupMessageData.read_status);

			return res.send(response.success(200, 'Success', MatchedPopupMessageData ));
		} else {
			return res.send(response.error(400, 'data not found', [] ));
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.matchedPopupStatusUpdate = async (req,res) => {
	try {
		let MatchedPopupMessageData = await MatchedPopupMessage.findOneAndUpdate({_id: req.body.matched_popup_id}, {read_status: 1}, {new:true,runValidators:true});

		if (MatchedPopupMessageData) {
			return res.send(response.success(200, 'Success', MatchedPopupMessageData ));
		} else {
			return res.send(response.error(400, 'data not found', [] ));
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}