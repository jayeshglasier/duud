const response = require("../../helper/response");
const {errorLog,consoleLog} = require("../../helper/consoleLog");
const MatchBasicQueAus = require("../../models/MatchBasicQueAus");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

exports.matchBasicQueAusStore = async (req,res) => {
	try {
		const schema = Joi.object({
			topic_id: Joi.string().required().trim(true).label('topic_id'),
			question: Joi.string().required().trim(true).label('question'),
			answer_one: Joi.string().required().trim(true).label('answer_one'),
			answer_two: Joi.string().required().trim(true).label('answer_two'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsMatchBasicQueAus = await MatchBasicQueAus.exists({ question: req.body.question,topic_id: req.body.topic_id });
		if (existsMatchBasicQueAus) {
			return res.send(response.error(400, 'Question is already exists', []));
		}

		const matchBasicQueAus = new MatchBasicQueAus({
			topic_id: req.body.topic_id,
			question: req.body.question,
			answer_one: req.body.answer_one,
			answer_two: req.body.answer_two
		});
		const matchBasicQueAusData = await matchBasicQueAus.save();

		return res.send(response.success(200, 'Create topic question success', matchBasicQueAusData ));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.matchBasicQueAusList = async (req,res) => {
	try {
		let matchBasicQueAusData = await MatchBasicQueAus.find();

		return res.send(response.success(200, 'Success', matchBasicQueAusData ));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.matchBasicQueAusUpdate = async (req,res) => {
	try {
		const schema = Joi.object({
			_id: Joi.objectId().required().label('id'),
			question: Joi.string().required().trim(true).label('question'),
			answer_one: Joi.string().required().trim(true).label('answer_one'),
			answer_two: Joi.string().required().trim(true).label('answer_two'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const topic_id = await MatchBasicQueAus.findByIdAndUpdate(req.body._id, {question: req.body.question,answer_one: req.body.answer_one,answer_two: req.body.answer_two}, {new: true, runValidators: true});
		return res.send(response.success(200, 'Updated topic question success', topic_id ));
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}

exports.matchBasicQueAusDelete = async (req,res) => {
	try {
		// const topic_id = await MatchBasicQueAus.findByIdAndDelete(req.body.topic_id_id);
		// if (topic_id) {
			return res.send(response.success(200, 'topic_id is Deleted', []));
		// } else {
		// 	return res.send(response.error(400, 'topic_id not found', []));
		// }
	} catch (error) {
		errorLog(__filename, req.originalUrl, error);
		return res.send(response.error(500, 'Something want wrong', []));
	}
}