const response = require("../helper/response");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const UserFriend = require("../models/UserFriend");
const console = require("../helper/console");
const UserResource = require("./resources/UserResource");

exports.sendFriendRequest = async (req,res) => {
	try {
		const schema = Joi.object({
			friend_user_id: Joi.objectId().required().label('friend user id').messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsFriendRequestPending = await UserFriend.findOne({friend_request_status: 0}).and([ 
			{ $or: [ {user_id: req.user._id}, {friend_user_id: req.user._id} ] }, 
			{ $or: [ {user_id: req.body.friend_user_id}, {friend_user_id: req.body.friend_user_id} ] } 
		]);
		if (existsFriendRequestPending) {
			return res.send(response.error(400, 'already requested', []));
		}
		const existsFriendRequestAccept = await UserFriend.findOne({friend_request_status: 1}).and([ 
			{ $or: [ {user_id: req.user._id}, {friend_user_id: req.user._id} ] }, 
			{ $or: [ {user_id: req.body.friend_user_id}, {friend_user_id: req.body.friend_user_id} ] } 
		]);
		if (existsFriendRequestAccept) {
			return res.send(response.error(400, 'this User already your friends', []));
		}

		let UserFriendData = new UserFriend({
			user_id: req.user._id,
			friend_user_id: req.body.friend_user_id,
		});
		await UserFriendData.save();
		UserFriendData = JSON.parse(JSON.stringify(UserFriendData));

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.cancelSendFriendRequest = async (req,res) => {
	try {
		const schema = Joi.object({
			friend_request_id: Joi.objectId().required().label('friend request id').messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const userFriendData = await UserFriend.findOneAndRemove({_id: req.body.friend_request_id, friend_request_status: 0});
		if (userFriendData) {
			return res.send(response.success(200, 'Request is canceled', userFriendData ));
		} else {
			return res.send(response.error(400, 'Request not found', []));
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.sendFriendRequestUserList = async (req,res) => {
	try {
		const friendUserList = await UserFriend.find({user_id: req.user._id, friend_request_status: 0}).populate({path: 'friend_user_id', match: {status: 1}});

		let friendUserListData = [];
		let friendUserId = [];
		friendUserList.forEach(element => {
			if (element.friend_user_id != null) {
				if (!friendUserId.includes(element.friend_user_id._id)) {
					friendUserId.push(element.friend_user_id._id);
					friendUserListData.push({ friend_request_id: element._id, user_data: UserResource(element.friend_user_id)[0] });
				}
			}
		});
		// friendUserListData = Array.from(new Set(friendUserListData.map(JSON.stringify))).map(JSON.parse); //remove duplicate object in array

		return res.send(response.success(200, 'Success', friendUserListData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.receiveFriendRequestUserList = async (req,res) => {
	try {
		const friendUserList = await UserFriend.find({friend_user_id: req.user._id, friend_request_status: 0}).populate({path: 'user_id', match: {status: 1}});

		let friendUserListData = [];
		let friendUserId = [];
		friendUserList.forEach(element => {
			if (element.user_id != null) {
				if (!friendUserId.includes(element.user_id._id)) {
					friendUserId.push(element.user_id._id);
					friendUserListData.push({ friend_request_id: element._id, user_data: UserResource(element.user_id)[0] });
				}
			}
		});
		// friendUserListData = Array.from(new Set(friendUserListData.map(JSON.stringify))).map(JSON.parse); //remove duplicate object in array

		return res.send(response.success(200, 'Success', friendUserListData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.receiveFriendRequestStatusChange = async (req,res) => {
	try {
		const schema = Joi.object({
			request_id: Joi.objectId().required().label('request id').messages({'string.pattern.name': `{{#label}} is invalid`}),
			friend_request_status: Joi.number().required().valid(1,2).label('friend request status'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let friendUserList;
		if (req.body.friend_request_status == 2) { //friend request is reject then deleted record
			friendUserList = await UserFriend.findOneAndDelete({_id: req.body.request_id, friend_request_status: 0});
			if (!friendUserList) return res.send(response.error(400, 'Friend Request Not Exists', []));
		} else {
			friendUserList = await UserFriend.findOneAndUpdate({_id: req.body.request_id, friend_request_status: 0}, {friend_request_status: req.body.friend_request_status}, {new:true,runValidators:true});
			if (!friendUserList) return res.send(response.error(400, 'Friend Request Not Exists', []));
		}

		return res.send(response.success(200, 'Success', friendUserList ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.friendUserList = async (req,res) => {
	try {
		const friendUserList = await UserFriend.find({friend_request_status: 1}).and([
				{ $or: [ {user_id: req.user._id}, {friend_user_id: req.user._id} ] }
			]).populate({path: 'user_id', match: {status: 1}}).populate({path: 'friend_user_id', match: {status: 1}});

		let friendUserListData = [];
		let friendUserId = [];
		friendUserList.forEach(element => {
			if (element.user_id != null && element.friend_user_id != null) {
				if (String(element.user_id._id) == String(req.user._id)) {
					if (!friendUserId.includes(element.friend_user_id._id)) {
						friendUserId.push(element.friend_user_id._id);
						friendUserListData.push({ friend_request_id: element._id, user_data: UserResource(element.friend_user_id)[0] });
					}
				} else if (String(element.friend_user_id._id) == String(req.user._id)) {
					if (!friendUserId.includes(element.user_id._id)) {
						friendUserId.push(element.user_id._id);
						friendUserListData.push({ friend_request_id: element._id, user_data: UserResource(element.user_id)[0] });
					}
				}
			}
		});
		// friendUserListData = Array.from(new Set(friendUserListData.map(JSON.stringify))).map(JSON.parse); //remove duplicate object in array

		return res.send(response.success(200, 'Success', friendUserListData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}