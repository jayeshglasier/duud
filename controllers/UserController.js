const User = require("../models/User");
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs");
const response = require("../helper/response");
const commonHelpers = require("../helper/commonHelpers");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const console = require("../helper/console");
const ProfileQuestion = require('../models/ProfileQuestion');
const UserResource = require('./resources/UserResource');
const ProfileLanguage = require("../models/ProfileLanguage");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const ProfileViewLog = require('../models/ProfileViewLog');
const MatchedUsers = require('../models/MatchedUsers');
const Reporting = require('../models/Reporting');
const UserProfileReport = require('../models/UserProfileReport');
const {PushNotification} = require('../helper/PushNotification');
const UserSettingNotification = require('../models/UserSettingNotification');

exports.userProfile = async (req, res) => {
	try {
		let UserData = await User.findOne({_id: req.user._id, status: 1}).populate({path: 'question_answer.question_id', match: {status: 1}}).populate({path: 'language'});
		UserData = JSON.parse(JSON.stringify(UserData));
		UserData.profile_per = commonHelpers.userProfilePer(UserData);

		const questionAnswerListArray = [];
		const questionAnswerIdsArray = [];

		UserData.question_answer.forEach(question_answer => {
			// _id = answer id
			if (question_answer.question_id != null) {
				questionAnswerListArray.push({ "_id": question_answer.question_id._id, "question": question_answer.question_id.question, "suggestions": question_answer.question_id.suggestions, "answer": question_answer.answer });
				questionAnswerIdsArray.push(question_answer.question_id._id);
			}
		});
		UserData.question_answer = questionAnswerListArray;
		const answerCount = Object.keys(UserData.question_answer).length;

		if (answerCount >= 0 && answerCount < 5) {
			let questionListLimit = Math.abs(5 - answerCount);
			const questionList = await ProfileQuestion.find({ _id : { $nin: questionAnswerIdsArray }, status: 1}).sort({'created_at': -1}).limit(questionListLimit);
			const questionArray = [];
			questionList.forEach(question => {
				// _id = question id
				questionArray.push({ "_id": question._id, "question": question.question, "suggestions": question.suggestions , "answer": "" });
			});
			UserData.question_answer = UserData.question_answer.concat(questionArray);
		}

		return res.send(response.success(200, 'success', UserResource(UserData)));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.getProfileLanguage = async (req, res) => {
	try {
		let UserData = await User.findOne({_id: req.user._id, status: 1}).populate({path: 'language'});

		return res.send(response.success(200, 'success', {language: UserData.language}));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.updateUser = async (req, res) => {
	try {
		if (req.body.language) { //comma string to array for multi language store
			req.body.language = req.body.language.split(',');
			req.body.language = req.body.language.filter(x => x != "");
		} else {
			req.body.language = [];
		}

		const validation = User.userValidate(req.body); //user data validation
		if (validation.error){ //if any error message
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		if (req.files) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/uploads/profile_images/';
			let fileName;

			if (profile_image) {
				if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				if (profile_image.size >= (1024 * 1024 * 50)) { // if getter then 50MB
					return res.send(response.error(400, 'Image must be less then 50MB', []));
				}
				fileName = 'profile-image-' + req.user._id + '-' + Date.now() + path.extname(profile_image.name);
				profile_image.mv(uploadPath + fileName, function(err) {
					if (err){
						return res.send(response.error(400, 'Image uploading failed', []));
					}
				});
				req.body.profile_image = '/public/uploads/profile_images/' + fileName;
			}
		}

		// remove null or blank value key remove
		Object.keys(req.body).forEach((key) => { if(req.body[key] == '' || req.body[key] == null || req.body[key] == 'undefined') delete req.body[key] });

		req.body.registration_status = 1;
		const updates = Object.keys(req.body);
		const allowedUpdates = ['name', 'birth_date', 'gender', 'interest', 'about', 'why_im_here', 'hometown', 'language', 'occupation', 'height', 'children', 'edu_qualification', 'relationship_status', 'smoking','profile_image','registration_status'];
		const isValidOperation = updates.every((update) =>  allowedUpdates.includes(update));
		if (!isValidOperation) {
			return res.send(response.error(400, 'Invalid update fields!', [] ));
		}

		let updateUser = await User.findOneAndUpdate({_id: req.user._id, status: 1}, req.body, {new:true,runValidators:true} );
		updateUser = JSON.parse(JSON.stringify(updateUser));
		updateUser.token = req.user.token;
		updateUser.profile_per = commonHelpers.userProfilePer(req.user);

		return res.send(response.success(200, 'success', UserResource(updateUser)));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.profileImageUpload = async (req, res) => {
	try {
		if (req.files && req.files.profile_image) {
			let profile_image = req.files.profile_image;
			let uploadPath = __basedir + '/public/uploads/profile_images/';

			const extensionName = path.extname(profile_image.name);
			const allowedExtension = ['.png','.jpg','.jpeg'];
			if(!allowedExtension.includes(extensionName)){
				return res.send(response.error(422, 'File format should be PNG,JPG,JPEG', []));
			}

			if (profile_image.mimetype !== "image/png" && profile_image.mimetype !== "image/jpg" && profile_image.mimetype !== "image/jpeg"){
				return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
			}
			if (profile_image.size >= (1024 * 1024 * 50)) { // if getter then 50MB
				return res.send(response.error(400, 'Image must be less then 50MB', []));
			}
			let fileName = 'profile-image-' + req.user._id + '-' + Date.now() + path.extname(profile_image.name);
			profile_image.mv(uploadPath + fileName, function(err) {
				if (err){
					return res.send(response.error(400, 'Image uploading failed', []));
				}
			});
			fileName = '/public/uploads/profile_images/' + fileName;
			let userData = await User.findOneAndUpdate({_id: req.user._id, status: 1}, {profile_image: fileName}, {new:true,runValidators:true});
			return res.send(response.success(200, 'uploaded profile image successfully', {"profile_image": userData.profile_image} ));
		} else {
			return res.send(response.error(400, 'Please select an image', [] ));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.albumImageUpload = async (req, res) => {
	try {
		if (req.files && req.files.album_images) {
			let album_images = req.files.album_images;
			let uploadPath = __basedir + '/public/uploads/album_images/';
			let albumImageNameArray = req.user.album_images;

			if (Array.isArray(album_images)) {
				album_images.forEach(album_image => {
					if (album_image.mimetype !== "image/png" && album_image.mimetype !== "image/jpg" && album_image.mimetype !== "image/jpeg"){
						return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
					}
					if (album_image.size >= (1024 * 1024 * 50)) { // if getter then 50MB
						return res.send(response.error(400, 'Image must be less then 50MB', []));
					}
				});
				album_images.forEach(album_image => {
					let randomNumber = Math.floor(Math.random() * 100) + 1; //0-99 random number
					fileName = 'album-image-' + req.user._id + '-' + Date.now() + randomNumber + path.extname(album_image.name);
					album_image.mv(uploadPath + fileName, function(err) {
						if (err){
							return res.send(response.error(400, 'Image uploading failed', []));
						}
					});
					albumImageNameArray.push('/public/uploads/album_images/' + fileName);
				});
			} else {
				if (album_images.mimetype !== "image/png" && album_images.mimetype !== "image/jpg" && album_images.mimetype !== "image/jpeg"){
					return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
				}
				fileName = 'album-image-' + req.user._id + '-' + Date.now() + path.extname(album_images.name);
				album_images.mv(uploadPath + fileName, function(err) {
					if (err){
						return res.send(response.error(400, 'Image uploading failed', []));
					}
				});
				albumImageNameArray.push('/public/uploads/album_images/' + fileName);
			}
			await User.findOneAndUpdate({_id: req.user._id, status: 1}, {album_images: albumImageNameArray}, {new:true,runValidators:true} );
			return res.send(response.success(200, 'uploaded album images successfully', []));
		} else {
			return res.send(response.error(400, 'Please select an image', [] ));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.albumImageDelete = async (req, res) => {
	try {
		const userData = await User.findOne({_id: req.user._id, status: 1});
		const image_name = req.body.album_image_name;
		const DIR = "/public/uploads";

		let existsAlbumImage = userData.album_images.filter(function(item) {
			if (item) { // if album_image name exists
				return item.toLowerCase().indexOf(image_name.toLowerCase()) >= 0;
			}
		});

		let fileExists = fs.existsSync(DIR +'/'+ image_name);

		if (existsAlbumImage.length > 0 && fileExists) {	
			fs.unlinkSync(DIR+'/'+image_name); // delete from directory

			const filteredAlbumImages = userData.album_images.filter(function(item) {
				if (item) { // album_image array remove deleted image name value
					return item.toLowerCase().indexOf(image_name.toLowerCase()) <= 0;
				}
			});
			const updateUser = await User.findOneAndUpdate({_id: req.user._id, status: 1}, {album_images: filteredAlbumImages}, {new:true,runValidators:true});
			return res.send(response.success(200, 'Image Delete successfully', [] ));
		} else {
			return res.send(response.error(400, 'Image not exists', []));
		}
		
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.changePassword = async (req, res) => {
	try {
		const userData = await User.findOne({ _id: req.user._id, status: 1 }).select("+password");
		if (userData) {
			const isMatch = await bcrypt.compare(req.body.old_password, userData.password);
			if (isMatch) {
				const updateUser = await User.findOneAndUpdate({_id: req.user._id, status: 1}, {password: req.body.new_password}, {new:true,runValidators:true});
				return res.send(response.success(200, 'Password Change successfully', []));
			} else {
				return res.send(response.error(400, 'Currant Password is wrong', []));
			}
		} else {
			return res.send(response.error(400, 'Data Not found', []));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.deleteUser = async (req, res) => {
	try {
		// const deleteUser = await User.findOneAndUpdate({_id: req.user._id, status: 1}, {status: 9}, {new:true,runValidators:true});
		// if (deleteUser) {
		// 	return res.send(response.success(200, 'User is Deleted', []));
		// } else {
		// 	return res.send(response.error(400, 'User not found', []));
		// }
		let deleteUser = await User.findOne({_id: req.user._id, status: 1});
		if (!deleteUser) return res.send(response.error(400, 'User not found', []));
		deleteUser.email = "XYZ-" + deleteUser.email;
		deleteUser.social_id = "XYZ-" + deleteUser.social_id;
		deleteUser.status = 9;
		await deleteUser.save();
		return res.send(response.success(200, 'User is Deleted', []));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.updateLocation = async (req,res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['longitude','latitude'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
	if (!isValidOperation) {
		return res.send(response.error(400, 'Invalid update fields!', [] ));
	}
	try {
		const longitude = parseFloat(req.body.longitude);
		const latitude = parseFloat(req.body.latitude);
		const updateUsers = await User.findOneAndUpdate({_id: req.user._id, status: 1}, { location: { type: "Point", coordinates: [longitude, latitude] } }, {new:true,runValidators:true});

		const userData = {};
		userData.location = updateUsers.location;

		return res.send(response.success(200, 'location update successfully', []));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.findLocation = async (req,res) => {
	try {
		const schema = Joi.object({
			interest: Joi.number().required(),
			min_age: Joi.number().required().label('min age'),
			max_age: Joi.number().required().label('max age'),
			distance: Joi.number().required(),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let MatchedUsersList = await MatchedUsers.find({ user_id : req.user._id, block_status: 1 }); //get blocked user ids
		MatchedUsersList = MatchedUsersList.map(function(i) { return i.matched_user_id; });
		MatchedUsersList.push(req.user._id);

		if (req.user.location == undefined) {
			return res.send(response.error(400, "Please enable your location", [] ));
		}

		const longitude = parseFloat(req.user.location.coordinates[0]);
		const latitude = parseFloat(req.user.location.coordinates[1]);

	 	const UserData = await User.aggregate([ 
			 	{
					$geoNear: {
						"near": {
							"type": "Point",
							"coordinates": [longitude, latitude]
						},
						"maxDistance": 1609 * req.body.distance, //km
						"spherical": true,
						"distanceField": "distance",
						"distanceMultiplier": 0.001
					}
				},{
					$addFields: { 
						age: { 
							$divide: [ {$subtract: [ new Date(), "$birth_date" ]}, (365 * 24*60*60*1000) ]
						} 
					}
				},{
					$match: {
						_id: { "$nin": MatchedUsersList },
						gender: { "$in": req.body.interest == '3' ? [1,2,3] : [parseInt(req.body.interest)] },
						birth_date : {
							$lte: new Date(new Date().setFullYear(new Date().getFullYear() - req.body.min_age)), //18
							$gte: new Date(new Date().setFullYear(new Date().getFullYear() - req.body.max_age)), //27
						},
						status: 1
					}
				}
			]);
		
		return res.send(response.success(200, 'success', UserResource(UserData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.languageList = async (req,res) => {
	try {
		let ProfileLanguageData = await ProfileLanguage.find({status: 1});
		return res.send(response.success(200, 'success', {language: ProfileLanguageData}));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.viewUserProfileDetails = async (req,res) => {
	try {
		const schema = Joi.object({
			user_id: Joi.objectId().label('user id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let UserData = await User.findOne({_id: req.body.user_id, status: 1}).populate({path: 'language'}).lean();

		//for Profile View Log
		const ProfileViewLogData = await ProfileViewLog.findOne({ user_id: req.user._id, view_profile_user_id: req.body.user_id });
		if (!ProfileViewLogData) {
			await ProfileViewLog.create({ user_id: req.user._id, view_profile_user_id: req.body.user_id });

			//send push notification for Views
			let receiver_id = req.body.user_id;
			let notification_title = 'Someone Views your profile!';
			let notification_body = '';
			const UserSettingNotificationData = await UserSettingNotification.findOne({user_id: receiver_id, notification_id: '61a8b4dc48ad09388cb51d4e', status: 0}); //Views
			if (!UserSettingNotificationData) {			
				let data = await PushNotification(req.user._id, receiver_id, notification_title, notification_body);
				if (data.error) return res.send(response.success(400, data.error, []));
			}
		}

		UserData = UserResource(UserData)[0];

		let MatchedUserExists = await MatchedUsers.findOne({user_id: req.user._id, matched_user_id: req.body.user_id});
		if (MatchedUserExists) {
			UserData.like_unlike_status = MatchedUserExists.like_unlike_status ? String(MatchedUserExists.like_unlike_status) : "0";
			UserData.super_like_status = MatchedUserExists.super_like_status ? String(MatchedUserExists.super_like_status) : "0";
		} else {
			UserData.like_unlike_status = "0";
			UserData.super_like_status = "0";
		}

		return res.send(response.success(200, 'success', UserData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.viewMultipleUserDetails = async (req,res) => {
	try {
		const schema = Joi.object({
			user_id: Joi.array().required().items(Joi.objectId().label('user id').required().messages({'string.pattern.name': `{{#label}} is invalid`})),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let UserData = await User.find({_id: { $in: req.body.user_id }, status: 1});

		return res.send(response.success(200, 'success', UserResource(UserData)));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.userStatusUpdate = async (req,res) => {
	try {
		const schema = Joi.object({
			matched_user_id: Joi.objectId().label('Matched user id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			like_unlike_status: Joi.number().label('Like unlike status'),
			super_like_status: Joi.number().label('Super like status'),
			report_status: Joi.number().label('Report status'),
			block_status: Joi.number().label('Block status'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		if (req.body.like_unlike_status == undefined && req.body.super_like_status == undefined && req.body.report_status == undefined && req.body.block_status == undefined) {
			return res.send(response.error(400, 'status is required', []));
		}

		let MatchedUserData = await MatchedUsers.findOne({user_id: req.user._id, matched_user_id: req.body.matched_user_id});

		if (MatchedUserData) {
			const updateUser = await MatchedUsers.findOneAndUpdate({user_id: req.user._id, matched_user_id: req.body.matched_user_id}, req.body, {new:true,runValidators:true});
		} else {
			const MatchedUser = new MatchedUsers({
				user_id: req.user._id,
				matched_user_id: req.body.matched_user_id,
				like_unlike_status: req.body.like_unlike_status,
				super_like_status: req.body.super_like_status,
				report_status: req.body.report_status,
				block_status: req.body.block_status,
			});
			await MatchedUser.save();
		}

		return res.send(response.success(200, 'Status store successfully', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.profileReportList = async (req,res) => {
	try {
		let ReportingData = await Reporting.find({status: 1});

		return res.send(response.success(200, 'Status store successfully', ReportingData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.profileReportStore = async (req,res) => {
	try {
		const schema = Joi.object({
			reported_user_id: Joi.objectId().label('user id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			report_id: Joi.objectId().label('report id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			report_text: Joi.string().allow('',null).label('report text'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let ReportExists = await Reporting.findOne({_id: req.body.report_id});
		if (!ReportExists) return res.send(response.error(400, 'Report not found', []));

		let reportedUserExists = await User.findOne({_id: req.body.reported_user_id, status: 1});
		if (!reportedUserExists) return res.send(response.error(400, 'User not found', []));

		let MatchedUserData = await MatchedUsers.findOne({user_id: req.user._id, matched_user_id: req.body.reported_user_id});
		if (MatchedUserData) {
			const updateUser = await MatchedUsers.findOneAndUpdate({user_id: req.user._id, matched_user_id: req.body.reported_user_id}, {report_status: 1}, {new:true,runValidators:true});
		} else {
			const MatchedUser = new MatchedUsers({
				user_id: req.user._id,
				matched_user_id: req.body.reported_user_id,
				report_status: 1,
			});
			await MatchedUser.save();
		}

		const UserProfileReportData = new UserProfileReport({
			user_id: req.user._id,
			reported_user_id: req.body.reported_user_id,
			report_id: req.body.report_id,
			report_text: req.body.report_text,
		});
		await UserProfileReportData.save();

		return res.send(response.success(200, 'Status store successfully', UserProfileReportData ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, []));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}