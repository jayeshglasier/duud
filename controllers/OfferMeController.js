const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const OfferMe = require('../models/OfferMe');
const OfferMeResource = require('../controllers/resources/OfferMeResource');
const UserResource = require('../controllers/resources/UserResource');
const {getAge} = require('../helper/commonHelpers');

function validation(data, updateSchema){
	let schema = Joi.object({
		purpose: Joi.string().trim().label('purpose').trim().required(),
		comments: Joi.string().trim().label('comments').trim().allow('',null),
		interest: Joi.number().label('interest').allow('',null),
		min_age: Joi.number().label('min_age').allow('',null),
		max_age: Joi.number().label('max_age').allow('',null),
		height: Joi.number().label('height').allow('',null),
		filter_by: Joi.number().label('filter_by').allow('',null),
		location: Joi.string().trim().label('location').trim().allow('',null),
		relationship_status: Joi.number().label('relationship_status').allow('',null),
		weight: Joi.number().label('weight').allow('',null),
		eye_colour: Joi.string().trim().label('eye_colour').allow('',null),
		hair_colour: Joi.string().trim().label('hair_colour').allow('',null),
		religion: Joi.string().trim().label('religion').allow('',null),
		nationality: Joi.string().trim().label('nationality').allow('',null),
	});

	if (updateSchema == "update") {
		schema = schema.append({
			offer_id: Joi.objectId().label('offer id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
	}

	const validation = schema.validate(data, __joiOptions);
	if (validation.error){
		return validation.error.details[0].message;
	}
}

exports.createOffer = async (req,res) => {
	try {
		const validationData = validation(req.body);
		if (validationData) return res.send(response.error(400, validationData, [] ));

		const OfferMeData = new OfferMe({
			user_id: req.user._id,
			purpose: req.body.purpose,
			comments: req.body.comments,
			interest: req.body.interest,
			min_age: req.body.min_age,
			max_age: req.body.max_age,
			height: req.body.height,
			filter_by: req.body.filter_by,
			location: req.body.location,
			relationship_status: req.body.relationship_status,
			weight: req.body.weight,
			eye_colour: req.body.eye_colour,
			hair_colour: req.body.hair_colour,
			religion: req.body.religion,
			nationality: req.body.nationality,
		});
		await OfferMeData.save();

		return res.send(response.success(200, 'Offer Me store successfully', OfferMeData ));
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

exports.updateOffer = async (req,res) => {
	try {
		const validationErrorData = validation(req.body, "update");
		if (validationErrorData) return res.send(response.error(400, validationErrorData, [] ));

		const OfferMeData = await OfferMe.findOneAndUpdate({_id: req.body.offer_id, status: 1}, req.body ,{new:true,runValidators:true});
		if (!OfferMeData) return res.send(response.error(400, 'data not found', [] ));

		return res.send(response.success(200, 'Offer update successfully', OfferMeResource(OfferMeData) ));
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

exports.deleteOffer = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_id: Joi.objectId().label('offer id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const OfferMeData = await OfferMe.findOneAndUpdate({_id: req.body.offer_id, status: 1}, {status: 0}, {new:true,runValidators:true});
		if (!OfferMeData) return res.send(response.error(400, 'data not found', [] ));

		return res.send(response.success(200, 'Offer delete successfully', [] ));
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

exports.myOfferList = async (req,res) => {
	try {
		const OfferMeData = await OfferMe.find({user_id: req.user._id, status: 1}).select('+created_at').sort({created_at: -1});

		// return res.send(response.success(200, 'Success', OfferMeData ));
		return res.send(response.success(200, 'Success', OfferMeResource(OfferMeData) ));
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

exports.OfferMeList = async (req,res) => {
	try {
		let findObject = {
			user_id: { $ne: req.user._id },
			status: 1 
		}
		if (req.user.gender != undefined) {
			findObject.interest = req.user.gender;
		}
		if (req.user.age != undefined) {
			findObject.min_age = { $lte: req.user.age };
			findObject.max_age = { $gte: req.user.age };
		}
		if (req.user.height != undefined) {
			findObject.height = { $gte: req.user.height };
		}
		// filter_by: req.user.filter_by
		// location: req.user.hometown
		if (req.user.relationship_status != undefined) {
			findObject.relationship_status = req.user.relationship_status;
		}

		const OfferMeData = await OfferMe.find(findObject).populate({path: 'user_id', match: {status: 1}, select: ['name','birth_date','profile_image']}).lean();

		for (let i = 0; i < OfferMeData.length; i++) {
			const element = OfferMeData[i];
			if (element.user_id == null) {
				OfferMeData.splice(i, 1);
				i--;
			} else {
				let age = 0;
				if (element.user_id.birth_date) {
					age = getAge(element.user_id.birth_date);
				}
				element.user_id.age = String(age);
			}
		}

		return res.send(response.success(200, 'Success', OfferMeResource(OfferMeData) ));
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

exports.offerMeUserDetails = async (req,res) => {
	try {
		const schema = Joi.object({
			offer_id: Joi.objectId().label('offer id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let OfferMeData = await OfferMe.findOne({_id: req.body.offer_id}).populate({path: 'user_id', match: {status: 1}}).lean();
		if (!OfferMeData || OfferMeData.user_id == null) return res.send(response.error(400, 'data not found', [] ));
		
		OfferMeData.user_id = UserResource(OfferMeData.user_id)[0];
		OfferMeData = OfferMeResource(OfferMeData);

		return res.send(response.success(200, 'Success', OfferMeData ));
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