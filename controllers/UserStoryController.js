const response = require("../helper/response");
const console = require("../helper/console");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const UserStory = require("../models/UserStory");
const path = require('path');
const fs = require('fs');
const UserStoryResource = require('./resources/UserStoryResource');
const UserResource = require('./resources/UserResource');
const UserFriend = require("../models/UserFriend");
const UserStorySeen = require("../models/UserStorySeen");
const User = require("../models/User");

exports.createUserStory = async (req,res) => {
	try {
		if (req.files && req.files.story_file) {
			let story_file = req.files.story_file;
			let uploadPath = __basedir + '/public/uploads/story_files/';

			// const allowedExtension = ['.png','.jpg','.jpeg'];
			// if(!allowedExtension.includes(path.extname(story_file.name))){
			// 	return res.send(response.error(422, 'File format should be PNG,JPG,JPEG', []));
			// }
			const allowedMimetype = ['image/png','image/jpg','image/jpeg','image/webp','image/gif','video/mp4','video/webm'];
			if(!allowedMimetype.includes(story_file.mimetype)){
				return res.send(response.error(422, 'File format should be PNG,JPG,JPEG', []));
			}
			if (story_file.size >= (1024 * 1024 * 20)) { // if getter then 20MB
				return res.send(response.error(400, 'Story must be less then 20MB', []));
			}
			let fileName = 'story-file-' + req.user._id + '-' + Date.now() + path.extname(story_file.name);
			story_file.mv(uploadPath + fileName, function(err) {
				if(err){
					return res.send(response.error(400, 'Story uploading failed', []));
				}
			});
			fileName = '/public/uploads/story_files/' + fileName;

			const UserStoryData = new UserStory({
				user_id: req.user._id,
				story_file: fileName
			});
			await UserStoryData.save();

			const responseData = {
				_id: UserStoryData._id,
				story_file: UserStoryData.story_file,
				created_at: UserStoryData.created_at
			};

			return res.send(response.success(200, 'Story uploaded successfully', responseData));
		} else {
			return res.send(response.error(400, 'Please select Story File', [] ));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.deleteUserStory = async (req,res) => {
	try {
		const schema = Joi.object({
			story_id: Joi.objectId().required().label('story id').messages({'string.pattern.name': `{{#label}} is invalid`})
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));
		
		const existsStoryData = await UserStory.findOne({_id: req.body.story_id});
		if (!existsStoryData) {
			return res.send(response.error(400, 'Story not exists', []));
		}
		let fileExists = fs.existsSync(existsStoryData.story_file);
		if (!fileExists) {
			return res.send(response.error(400, 'Story not exists', []));	
		}

		fs.unlinkSync(existsStoryData.story_file); // delete from directory
		const deleteStory = await UserStory.deleteOne({ _id: req.body.story_id });

		return res.send(response.success(200, 'Story Delete successfully', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.userStoryList = async (req,res) => {
	try {
		const storyData = await UserStory.find({user_id: req.user._id, created_at: {$gt: new Date(Date.now() - 24*60*60 * 1000)} }).lean();

		for (let i = 0; i < storyData.length; i++) {
			const elementData = storyData[i];
			const UserStorySeenData = await UserStorySeen.find({ story_id: elementData._id });
			elementData.story_viewer_count = UserStorySeenData.length;
		}

		return res.send(response.success(200, 'Success', UserStoryResource(storyData) ));
		// return res.send(response.success(200, 'Success', {story: UserStoryResource(storyData)} ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.userStoryViewerList = async (req,res) => {
	try {
		const schema = Joi.object({
			story_id: Joi.objectId().required().label('story id').messages({'string.pattern.name': `{{#label}} is invalid`})
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));
		
		const storyData = await UserStory.findOne({_id: req.body.story_id, user_id: req.user._id, created_at: { $gt: new Date(Date.now() - 24*60*60 * 1000)} } ).lean();

		if (!storyData) {
			return res.send(response.error(400, 'Story not found', [] ));
		}

		let UserStorySeenData = await UserStorySeen.find({ story_id: storyData._id }).populate({path: 'user_id', match: {status: 1}});

		for (let i = 0; i < UserStorySeenData.length; i++) {
			const element = UserStorySeenData[i];
			if (element.user_id == null) {
				UserStorySeenData.splice(i, 1);
				i--;
			}
		}

		// UserStorySeenData = Object.values(UserStorySeenData.reduce( (acc,cur) => Object.assign(acc, { [cur.user_id.toString()] : cur.user_id } ), {} ) );
		UserStorySeenData = UserStorySeenData.map(function(i) { return i.user_id; });

		return res.send(response.success(200, 'Success', UserResource(UserStorySeenData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.friendsStoryList = async (req,res) => {
	try {
		const friendUserList = await UserFriend.find({friend_request_status: 1})
			.and([ { $or: [ {user_id: req.user._id}, {friend_user_id: req.user._id} ] } ])
			.populate({path: 'user_id', match: {status: 1}})
			.populate({path: 'friend_user_id', match: {status: 1}}); //friend user list

		let friendStoryListData = [];
		let friendUserId = [];

		for (const friendUser of friendUserList) {
			if (friendUser.user_id != null || friendUser.friend_user_id != null) { //for user details null or friend user details null
				if (String(friendUser.user_id._id) == String(req.user._id)) {
					if (!friendUserId.includes(friendUser.friend_user_id._id)) {
						friendUserId.push(friendUser.friend_user_id._id);
	
						const UserStorySeenData = await UserStorySeen.find({ user_id: req.user._id }).select('story_id');
						let UserStorySeenIds = [...new Set(UserStorySeenData.map(item => item.story_id))]; //already seen story get only ids
						UserStorySeenIds = UserStorySeenIds.map(String); //objectId to Sting values
	
						const storyData = await UserStory.find({ user_id: friendUser.friend_user_id._id, created_at: { $gt: new Date(Date.now() - 24*60*60 * 1000)} } ).lean();
	
						for (let i = 0; i < storyData.length; i++) {
							const element = storyData[i];
							const existsStory = UserStorySeenIds.includes(String(element._id));
							if (existsStory) {
								element.seen_status = 1; //already seen story
							} else {
								element.seen_status = 0; //unseen story
							}
						}
						
						if (storyData.length > 0) {
							friendStoryListData.push({ user_id: friendUser.friend_user_id._id, name: friendUser.friend_user_id.name, profile_image: friendUser.friend_user_id.profile_image, story: UserStoryResource(storyData) });
						}
					}
				} else if (String(friendUser.friend_user_id._id) == String(req.user._id)) {
					if (!friendUserId.includes(friendUser.user_id._id)) {
						friendUserId.push(friendUser.user_id._id);
	
						const UserStorySeenData = await UserStorySeen.find({ user_id: req.user._id }).select('story_id');
						let UserStorySeenIds = [...new Set(UserStorySeenData.map(item => item.story_id))]; //already seen story get only ids
						UserStorySeenIds = UserStorySeenIds.map(String); //objectId to Sting values
	
						const storyData = await UserStory.find({ user_id: friendUser.user_id._id, created_at: { $gt: new Date(Date.now() - 24*60*60 * 1000)} } ).lean();
	
						for (let i = 0; i < storyData.length; i++) {
							const element = storyData[i];
							const existsStory = UserStorySeenIds.includes(String(element._id));
							if (existsStory) {
								element.seen_status = 1; //already seen story
							} else {
								element.seen_status = 0; //unseen story
							}
						}
	
						if (storyData.length > 0) {
							friendStoryListData.push({ user_id: friendUser.user_id._id, name: friendUser.user_id.name, profile_image: friendUser.user_id.profile_image, story: UserStoryResource(storyData) });
						}
					}
				}	
			}
		}

		return res.send(response.success(200, 'Success', friendStoryListData ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.friendsStorySeenStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			story_id: Joi.objectId().required().label('story id').messages({'string.pattern.name': `{{#label}} is invalid`})
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsUserStory = await UserStory.findOne({_id: req.body.story_id});
		if (!existsUserStory) return res.send(response.error(400, 'story not found', []));

		const existsUserStorySeen = await UserStorySeen.findOne({user_id: req.user._id, story_id: req.body.story_id});
		if (existsUserStorySeen) return res.send(response.success(200, 'story already seen', []));

		let UserStorySeenData = new UserStorySeen({
			user_id: req.user._id,
			story_id: req.body.story_id,
			seen_status: 1,
		});
		await UserStorySeenData.save();

		return res.send(response.success(200, 'Success', UserStorySeenData ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}
