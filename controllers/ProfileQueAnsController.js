const response = require("../helper/response");
const console = require("../helper/console");
const ProfileQuestion = require('../models/ProfileQuestion');
const User = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

exports.profileQuestionStore = async (req,res) => {
	try {
		if (req.body.question.trim() == "" || req.body.question == null) {
			return res.send(response.error(400, 'Question must be required', []));
		}
		const existsProfileQuestion = await ProfileQuestion.exists({ question: req.body.question });
		if (existsProfileQuestion) {
			return res.send(response.error(400, 'Question is already exists', []));
		}
		const profileQuestion = new ProfileQuestion({
			question: req.body.question,
			suggestions: req.body.suggestions
		});
		const profileQuestionData = await profileQuestion.save();

		return res.send(response.success(200, 'success', profileQuestionData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileQuestionList = async (req,res) => {
	try {
		let questionIdArray = [];
		Object.values(req.user.question_answer).forEach((value) => {questionIdArray.push(ObjectId(value.question_id)) });

		let profileQuestionData = await ProfileQuestion.find({ _id: {$nin: questionIdArray}, status: 1 });
		let data = [ {"question_answer": profileQuestionData} ];

		return res.send(response.success(200, 'Success', data ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileQuestionUpdate = async (req,res) => {
	try {
		const question = await ProfileQuestion.findByIdAndUpdate(req.body.question_id, {question: req.body.question, suggestions: req.body.suggestions}, {new:true,runValidators:true});
		return res.send(response.success(200, 'Update question success', question ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileQuestionDelete = async (req,res) => {
	try {
		// const question = await ProfileQuestion.findByIdAndDelete(req.body.question_id);
		// if (question) {
		// 	return res.send(response.success(200, 'Question is Deleted', []));
		// } else {
			return res.send(response.error(400, 'Question not found', []));
		// }
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileAnswerStore = async (req,res) => {
	try {
		const schema = Joi.object({
			question_id: Joi.objectId().required().label('question id').messages({'string.pattern.name': `{{#label}} is invalid`}),
			answer: Joi.string().label('answer').trim().required(),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const existsProfileQuestion = await ProfileQuestion.exists({ _id: req.body.question_id });
		if (!existsProfileQuestion) {
			return res.send(response.error(400, 'Question not exists', []));
		}

		const oldUserData = await User.findOne({_id: req.user._id, status: 1}); //get old data

		let existsQuestionAnswer = oldUserData.question_answer.find(o => o.question_id == req.body.question_id); //find already exists question id in user profile
		if (existsQuestionAnswer) {
			return res.send(response.success(200, 'your answer already exists', [] ));
		}
		if (oldUserData.question_answer.length >= 5) {
			return res.send(response.success(200, 'fill only 5 answer', [] ));
		}

		oldUserData.question_answer.push({"question_id": req.body.question_id, "answer": req.body.answer });

		const UserData = await User.findOneAndUpdate({_id: req.user._id, status: 1},
				{ question_answer: oldUserData.question_answer },
				{new:true,runValidators:true}).populate({path: 'question_answer.question_id', match: {status: 1}, select: ['question']});

		return res.send(response.success(200, 'Answer save successfully', [] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', error ));
	}
}

exports.profileAnswerUpdate = async (req,res) => {
	try {
		const schema = Joi.object({
			question_id: Joi.objectId().required().label('question id').messages({'string.pattern.name': `{{#label}} is invalid`}),
			answer: Joi.string().label('answer').trim().required(),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const oldUserData = await User.findOne({_id: req.user._id, status: 1});
		let exists = false;
		oldUserData.question_answer.forEach(element => {
			if (req.body.question_id == element.question_id) {
				exists = true;
				element.answer = req.body.answer;
			}
		});
		if (!exists) {
			return res.send(response.error(400, 'Question not exists', []));
		}
		const UserData = await User.findOneAndUpdate({_id: req.user._id, status: 1},
				{ question_answer: oldUserData.question_answer },
				{new:true,runValidators:true}).populate({path: 'question_answer.question_id', match: {status: 1}, select: ['question']});

		return res.send(response.success(200, 'Answer update successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileAnswerDelete = async (req,res) => {
	try {
		const schema = Joi.object({
			question_id: Joi.objectId().required().label('question id').messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const oldUserData = await User.findOne({_id: req.user._id, status: 1});
		oldUserData.question_answer = oldUserData.question_answer.filter((item) => item.question_id != req.body.question_id); //removed questions

		const UserData = await User.findOneAndUpdate({_id: req.user._id, status: 1},
				{ question_answer: oldUserData.question_answer },
				{new:true,runValidators:true}).populate({path: 'question_answer.question_id', match: {status: 1}, select: ['question']});

		return res.send(response.success(200, 'Answer delete successfully', [] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}