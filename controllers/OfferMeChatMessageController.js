const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const OfferMe = require('../models/OfferMe');
const OfferMeChatMessage = require('../models/OfferMeChatMessage');
const User = require('../models/User');
const UserResource = require('../controllers/resources/UserResource');

exports.offerMeChatUsersList = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_me_id: Joi.objectId().label('offer me id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const OfferMeChatMessageData = await OfferMeChatMessage.find({offer_me_id: req.body.offer_me_id})
				.and([ { $or: [ {sender_id: req.user._id}, {receiver_id: req.user._id} ] } ])
				.sort({created_at: -1});

		let userList1 = OfferMeChatMessageData.map(function(i) { return String(i.sender_id) });
		let userList2 = OfferMeChatMessageData.map(function(i) { return String(i.receiver_id) });
		let userList = userList1.concat(userList2); //merge user list
		userList = [ ...new Set(userList) ]; //unique User List
		userList = userList.filter((id) => id != req.user._id); //remove login user

		const userData = await User.find({_id: {$in: userList}, status: 1});

		return res.send(response.success(200, 'Success', UserResource(userData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.sendOfferMeMessage = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_me_id: Joi.objectId().label('offer me id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			receiver_id: Joi.objectId().label('receiver id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			message: Joi.string().trim(true).required().label('message'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const OfferMeChatMessageData = new OfferMeChatMessage({
			offer_me_id: req.body.offer_me_id,
			sender_id: req.user._id,
			receiver_id: req.body.receiver_id,
			message_offer_status: 0, //0=message
			message: req.body.message,
		});
		await OfferMeChatMessageData.save();

		return res.send(response.success(200, 'Success', OfferMeChatMessageData ));
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

exports.getOfferMeMessageList = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_me_id: Joi.objectId().label('offer me id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			receiver_id: Joi.objectId().label('receiver id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const OfferMeChatMessageData = await OfferMeChatMessage.find({offer_me_id: req.body.offer_me_id})
				.and([ 
					{ $or: [ {sender_id: req.user._id}, {receiver_id: req.user._id} ] },
					{ $or: [ {sender_id: req.body.receiver_id}, {receiver_id: req.body.receiver_id} ] }
				]);
		
		let ResponseArray = [];
		for (const resData of OfferMeChatMessageData) {
			ResponseArray.push({
				"_id": resData._id ? resData._id : "",
				"offer_me_id": resData.offer_me_id ? resData.offer_me_id : "",
				"sender_id": resData.sender_id ? resData.sender_id : "",
				"receiver_id": resData.receiver_id ? resData.receiver_id : "0",
				"message_offer_status": resData.message_offer_status || resData.message_offer_status== 0 ? String(resData.message_offer_status) : "",
				"message": resData.message ? resData.message : "",
				"offer_price": resData.offer_price || resData.offer_price== 0 ? String(resData.offer_price) : "",
				"offer_status": resData.offer_status || resData.offer_status== 0 ? String(resData.offer_status) : "",
			});
		}

		return res.send(response.success(200, 'Success', ResponseArray ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.sendOfferMeOffer = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_me_id: Joi.objectId().label('offer me id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			receiver_id: Joi.objectId().label('receiver id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			offer_price: Joi.number().integer().required().label('offer price'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const OldOfferData = await OfferMeChatMessage.updateMany({offer_me_id: req.body.offer_me_id, sender_id: req.user._id, receiver_id: req.body.receiver_id}, {offer_status: 2});
		const OldOfferData2 = await OfferMeChatMessage.updateMany({offer_me_id: req.body.offer_me_id, sender_id: req.body.receiver_id, receiver_id: req.user._id}, {offer_status: 2});

		const OfferMeChatMessageData = new OfferMeChatMessage({
			offer_me_id: req.body.offer_me_id,
			sender_id: req.user._id,
			receiver_id: req.body.receiver_id,
			message_offer_status: 1, //1=offer
			offer_price: req.body.offer_price,
			offer_status: 0, //0=pending
		});
		await OfferMeChatMessageData.save();

		return res.send(response.success(200, 'Success', OfferMeChatMessageData ));
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

exports.offerMeOfferAcceptReject = async (req,res) => {
	try {
		const schema = Joi.object({
			message_id: Joi.objectId().label('message id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			offer_status: Joi.number().integer().required().valid(1,2).label('offer status'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let OfferMeChatMessageData = await OfferMeChatMessage.findOneAndUpdate({_id: req.body.message_id, offer_status: 0}, {offer_status: req.body.offer_status}, {new:true,runValidators:true});
		if (!OfferMeChatMessageData) return res.send(response.error(400, 'Message Not Exists', []));

		return res.send(response.success(200, 'Success', OfferMeChatMessageData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.offerMeOtpShow = async (req,res) => {
	try {
		const otp = Math.floor(100000 + Math.random() * 900000);
		const updateUser = await User.findOneAndUpdate({_id: req.user._id, status: 1}, {otp: otp, otp_created_at: new Date()}, {new:true,runValidators:true} ).select('+otp');
		if (!updateUser) return res.send(response.error(400, 'User not found', []));

		return res.send(response.success(200, 'Success', {otp: updateUser.otp} ));
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

exports.offerMeOtpVerify = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_me_id: Joi.objectId().label('offer me id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			receiver_id: Joi.objectId().label('receiver id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			otp: Joi.number().integer().required().label('otp'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let OfferMeData = await OfferMe.findOne({_id: req.body.offer_me_id}).lean();
		if (!OfferMeData) return res.send(response.error(400, 'data not found', [] )); //offer me record invalid

		const OfferMeChatMessageData = await OfferMeChatMessage.findOne({offer_me_id: req.body.offer_me_id, sender_id: req.user._id, receiver_id: req.body.receiver_id}); //pending: offer accept then create & verify otp
		if (!OfferMeChatMessageData) return res.send(response.error(400, 'data not found', [] )); //offer me user chat not found 

		const UserData = await User.findOne({_id: req.body.receiver_id, otp_created_at: {$gt: new Date(Date.now() - 10*60*1000)}, status: 1 }).select('+otp +otp_created_at'); //otp expire within 10min
		if (!UserData) return res.send(response.error(400, 'OTP expired', [] ));
		if (UserData.otp == null || UserData.otp != req.body.otp) {
			return res.send(response.error(400, 'OTP is wrong', [] ));
		}

		return res.send(response.success(200, 'OTP verified successfully', [] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}
