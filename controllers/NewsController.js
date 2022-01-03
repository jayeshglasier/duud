const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const MatchedUsers = require('../models/MatchedUsers');
const UserResource = require('../controllers/resources/UserResource');
const ProfileViewLog = require('../models/ProfileViewLog');

exports.myProfileLikesUserList = async (req,res) => {
	try {
		let MatchedUsersList = await MatchedUsers.find({matched_user_id: req.user._id, like_unlike_status: 1, block_status: {$ne: 1}}).populate({path: 'user_id', match: {status: 1}});

		for (let i = 0; i < MatchedUsersList.length; i++) {
			const element = MatchedUsersList[i];
			if (element.user_id == null) {
				MatchedUsersList.splice(i, 1);
				i--;
			}
		}
		// MatchedUsersList = MatchedUsersList.filter(function(entry) { return entry.user_id != null; }); alternative for remove user_id is null

		MatchedUsersList = MatchedUsersList.map(function(i) { return i.user_id; });

		return res.send(response.success(200, 'Success', UserResource(MatchedUsersList) ));
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

exports.myProfileViewUserList = async (req,res) => {
	try {
		let ProfileViewLogData = await ProfileViewLog.find({view_profile_user_id: req.user._id}).populate({path: 'user_id', match: {status: 1}});

		for (let i = 0; i < ProfileViewLogData.length; i++) {
			const element = ProfileViewLogData[i];
			if (element.user_id == null) {
				ProfileViewLogData.splice(i, 1);
				i--;
			} else {
				let MatchedUsersList = await MatchedUsers.findOne({user_id: req.user._id, matched_user_id: element.user_id._id, block_status: {$ne: 1}});
				if (MatchedUsersList) { //if user is blocked then remove it
					ProfileViewLogData.splice(i, 1);
					i--;
				}
			}
		}

		// ProfileViewLogData = Object.values(ProfileViewLogData.reduce( (accumulator,currentValue) => Object.assign(accumulator, { [currentValue.user_id.toString()] : currentValue.user_id } ), {} ) );
		ProfileViewLogData = ProfileViewLogData.map(function(i) { return i.user_id; });

		return res.send(response.success(200, 'Success', UserResource(ProfileViewLogData) ));
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