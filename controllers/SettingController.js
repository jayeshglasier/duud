const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const MatchedUsers = require('../models/MatchedUsers');
const UserResource = require('../controllers/resources/UserResource');
const User = require('../models/User');
const { emailTransporterConfig } = require('../config/emailConfig');
const ejs = require("ejs");
const SettingNotification = require('../models/SettingNotification');
const UserSettingNotification = require('../models/UserSettingNotification');
const SettingPrivacy = require('../models/SettingPrivacy');
const UserSettingPrivacy = require('../models/UserSettingPrivacy');


exports.blockedUserList = async (req,res) => {
	try {
		let BlockedUsersList = await MatchedUsers.find({user_id: req.user._id, block_status: 1}).populate({path: 'matched_user_id', match: {status: 1}});

		for (let i = 0; i < BlockedUsersList.length; i++) {
			const element = BlockedUsersList[i];
			if (element.matched_user_id == null) {
				BlockedUsersList.splice(i, 1);
				i--;
			}
		}

		// BlockedUsersList = Object.values(BlockedUsersList.reduce( (acc,cur) => Object.assign(acc, { [cur.matched_user_id.toString()] : cur.matched_user_id } ), {} ) );
		BlockedUsersList = BlockedUsersList.map(function(i) { return i.matched_user_id; });

		return res.send(response.success(200, 'Success', UserResource(BlockedUsersList) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.unblockedUserStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			unblocked_user_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const userData = await MatchedUsers.findOneAndUpdate({user_id: req.user._id, matched_user_id: req.body.unblocked_user_id}, { block_status: 0 }, {new:true,runValidators:true});

		if (!userData) {
			return res.send(response.error(400, 'Data not found', [] ));
		}

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.changeEmailOrPassword = async (req,res) => {
	try {
		//for email changing
		if (req.body.email != "" && req.body.email != undefined) {
			const schema = Joi.object({
				email: Joi.string().email().required().trim(true).label('email'),
				password: Joi.string().allow('',null),
				confirm_password: Joi.string().allow('',null),
			});
			const validation = schema.validate(req.body, __joiOptions);
			if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

			if (req.user.email != req.body.email) {
				const existsUser = await User.findOne({ email: req.body.email });
				if(existsUser) {
					return res.send(response.error(400, 'email id already exists', [] ));
				}

				const userData = await User.findOneAndUpdate({_id: req.user._id, status: 1}, { email: req.body.email }, {new:true,runValidators:true});

				//sending email for Change email
				const transporter = emailTransporterConfig();
				const htmlFile = await ejs.renderFile(__basedir + "/views/email/changeEmail.ejs", { userData: userData });
				const mailOptions = {
					from: process.env.MAIL_FROM_ADDRESS, to: req.user.email,
					subject: 'Change Email Success',
					html: htmlFile
				};
				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						console.error('Email sent error: ' + JSON.stringify(error), __filename, req.originalUrl);
					} else {
						console.logs('Email sent success: ' + JSON.stringify(info.envelope) + '\n=> ' + info.response);
					}
					transporter.close();
				});
			}
		}

		//for password changing
		if(req.body.password != "" && req.body.password != undefined) {
			const schema = Joi.object({
				password: Joi.string().min(6).max(15).required().label('Password'),
				confirm_password: Joi.any().equal(Joi.ref('password')).required().label('Confirm password')
					.options({ messages: {'any.only': '{{#label}} does not match'} }),
				email: Joi.string().allow('',null),
			});
			const validation = schema.validate(req.body, __joiOptions);
			if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

			const userData = await User.findOneAndUpdate({_id: req.user._id, status: 1}, { password: req.body.password }, {new:true,runValidators:true});

			//sending email for Change Password
			const transporter = emailTransporterConfig();
			const htmlFile = await ejs.renderFile(__basedir + "/views/email/changePassword.ejs", { UserName: userData.name });
			const mailOptions = {
				from: process.env.MAIL_FROM_ADDRESS, to: userData.email,
				subject: 'Change Password Success',
				html: htmlFile
			};
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.error('Email sent error: ' + JSON.stringify(error), __filename, req.originalUrl);
				} else {
					console.logs('Email sent success: ' + JSON.stringify(info.envelope) + '\n=> ' + info.response);
				}
				transporter.close();
			});
		}

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		if (error.code == 11000) {
			return res.send(response.error(406, "email id already exists", [] ));
		} else if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.updateSocialId = async (req, res) => {
	try {
		const schema = Joi.object({
			social_id: Joi.string().required(),
			social_type: Joi.number().integer().valid(1,2,3).required(),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));
		
		await User.findOneAndUpdate({ _id: req.user._id, status: 1 }, { social_id: req.body.social_id, social_type: req.body.social_type }, {new:true,runValidators:true});

		return res.send(response.success(200, 'Success', []));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', [] ));
		}
	}
}

exports.storeNotificationSetting = async (req,res) => {
	try {
		const schema = Joi.object({
			title: Joi.string().trim(true).required().label('title'),
			suggestions: Joi.string().trim(true).allow('',null).label('suggestions'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsNotificationTitle = await SettingNotification.findOne({title: req.body.title}); //user_id: req.user._id
		if (existsNotificationTitle) {
			return res.send(response.error(400, 'Notification setting title already exists', [] ));
		}
		const SettingNotificationData = new SettingNotification({
			title: req.body.title,
			suggestions: req.body.suggestions,
		});
		await SettingNotificationData.save();

		return res.send(response.success(200, 'Success', [] ));
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

exports.getNotificationSettingList = async (req,res) => {
	try {
		const NotificationList = await SettingNotification.find().lean();
		for (let i = 0; i < NotificationList.length; i++) {
			const element = NotificationList[i];
			const existsUsersData = await UserSettingNotification.findOne({user_id: req.user._id, notification_id: element._id}).lean();
			if (existsUsersData) {
				element.status = existsUsersData.status;
			} else {
				element.status = 1;
			}
		}

		return res.send(response.success(200, 'Success', NotificationList ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.updateNotificationSettingStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			notification_id: Joi.objectId().label('notification id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			status: Joi.number().integer().required().valid(0,1).label('status'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsUsersData = await UserSettingNotification.findOne({user_id: req.user._id, notification_id: req.body.notification_id}).lean();
		if (existsUsersData) {
			await UserSettingNotification.findOneAndUpdate({user_id: req.user._id, notification_id: req.body.notification_id}, {status: req.body.status}, {new:true,runValidators:true});
		} else {
			const UserSettingNotificationData = new UserSettingNotification({
				notification_id: req.body.notification_id,
				user_id: req.user._id,
				status: req.body.status,
			});
			await UserSettingNotificationData.save();
		}

		return res.send(response.success(200, 'Success', [] ));
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

exports.storePrivacySetting = async (req,res) => {
	try {
		const schema = Joi.object({
			title: Joi.string().trim(true).required().label('title'),
			suggestions: Joi.string().trim(true).allow('',null).label('suggestions'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsPrivacyTitle = await SettingPrivacy.findOne({title: req.body.title}); //user_id: req.user._id
		if (existsPrivacyTitle) {
			return res.send(response.error(400, 'Privacy setting title already exists', [] ));
		}
		const SettingPrivacyData = new SettingPrivacy({
			title: req.body.title,
			suggestions: req.body.suggestions,
		});
		await SettingPrivacyData.save();

		return res.send(response.success(200, 'Success', [] ));
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

exports.getPrivacySettingList = async (req,res) => {
	try {
		const PrivacyList = await SettingPrivacy.find().lean();
		for (let i = 0; i < PrivacyList.length; i++) {
			const element = PrivacyList[i];
			const existsUsersData = await UserSettingPrivacy.findOne({user_id: req.user._id, privacy_id: element._id}).lean();
			if (existsUsersData) {
				element.status = existsUsersData.status;
			} else {
				element.status = 1;
			}
		}

		return res.send(response.success(200, 'Success', PrivacyList ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.updatePrivacySettingStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			privacy_id: Joi.objectId().label('privacy id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			status: Joi.number().integer().required().valid(0,1).label('status'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsUsersData = await UserSettingPrivacy.findOne({user_id: req.user._id, privacy_id: req.body.privacy_id}).lean();
		if (existsUsersData) {
			await UserSettingPrivacy.findOneAndUpdate({user_id: req.user._id, privacy_id: req.body.privacy_id}, {status: req.body.status}, {new:true,runValidators:true});
		} else {
			const UserSettingPrivacyData = new UserSettingPrivacy({
				privacy_id: req.body.privacy_id,
				user_id: req.user._id,
				status: req.body.status,
			});
			await UserSettingPrivacyData.save();
		}

		return res.send(response.success(200, 'Success', [] ));
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