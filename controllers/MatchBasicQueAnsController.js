const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const MatchBasicTopic = require('../models/MatchBasicTopic');
const MatchBasicTopicQue = require('../models/MatchBasicTopicQue');
const MatchBasicUserAns = require('../models/MatchBasicUserAns');
const MatchedBasicQueUserList = require('../models/MatchedBasicQueUserList');
const MatchBasicQueAnsResource = require('../controllers/resources/MatchBasicQueAnsResource');
const UserResource = require('../controllers/resources/UserResource');
const MatchBasicTopicResource = require('../controllers/resources/MatchBasicTopicResource');
const User = require("../models/User");

function validation(data, updateSchema){
	let schema = Joi.object({
		title: Joi.string().label('purpose').trim().required(),
	});

	if (updateSchema == "update") {
		// schema = schema.append({
		// 	offer_id: Joi.objectId().label('offer id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		// });
	}

	const validation = schema.validate(data, __joiOptions);
	if (validation.error){
		return validation.error.details[0].message;
	}
}

exports.matchQuestionTopicList = async (req,res) => {
	try {
		const MatchBasicTopicData = await MatchBasicTopic.find({status: 1}).lean();

		let MatchBasicTopicQueData = await MatchBasicTopicQue.aggregate([ {$match: { status: 1 }}, { $group: { _id: '$topic_id', count: { $sum: 1 } } } ]);
		let MatchBasicUserAnsData = await MatchBasicUserAns.aggregate([ {$match: { user_id: ObjectId(req.user._id), answer: {$ne: 0} }}, { $group: { _id: '$topic_id', count: { $sum: 1 } } } ]);

		for (let i = 0; i < MatchBasicTopicQueData.length; i++) {
			const data = MatchBasicTopicQueData[i];
			for (let j = 0; j < MatchBasicUserAnsData.length; j++) {
				const element = MatchBasicUserAnsData[j];
				if (String(data._id) == String(element._id)) {
					data.per = element.count * 100 / data.count;
				}
			}
			if (data.per == undefined) {
				data.per = 0;
			}
		}

		for (let i = 0; i < MatchBasicTopicData.length; i++) {
			const element1 = MatchBasicTopicData[i];
			for (let j = 0; j < MatchBasicTopicQueData.length; j++) {
				const element2 = MatchBasicTopicQueData[j];
				if (String(element1._id) == String(element2._id)) {
					element1.per = element2.per;
				}
			}
			if (element1.per == undefined) {
				element1.per = 0;
			}
		}

		return res.send(response.success(200, 'Success', MatchBasicTopicResource(MatchBasicTopicData) ));
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

exports.matchTopicQueAnsList = async (req,res) => {
	try {
		const schema = Joi.object({
			topic_id: Joi.objectId().label('topic id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let MatchBasicTopicQueData = await MatchBasicTopicQue.find({topic_id: req.body.topic_id, status: 1}).lean();

		let MatchBasicUserAnsData = await MatchBasicUserAns.find({user_id: req.user._id, topic_id: req.body.topic_id}).lean();

		for (let i = 0; i < MatchBasicTopicQueData.length; i++) {
			const TopicQueData = MatchBasicTopicQueData[i];
			let existsAnsData = MatchBasicUserAnsData.find(UserAnsData => String(UserAnsData.question_id) == String(TopicQueData._id) );
			if (existsAnsData) {
				TopicQueData.answer = existsAnsData.answer;
			} else {
				TopicQueData.answer = "0";
			}
		}

		return res.send(response.success(200, 'Success', MatchBasicQueAnsResource(MatchBasicTopicQueData) ));
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

exports.matchTopicQueAnsStore = async (req,res) => {
	try {
		const schema = Joi.object({
			topic_id: Joi.objectId().label('topic id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			question_answer: Joi.array().min(1).required().items(Joi.object().keys({
				question_id: Joi.objectId().label('question id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
				answer: Joi.string().trim(true).required().valid("0","1","2")
			}).min(2).max(2)),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const MatchBasicTopicData = await MatchBasicTopic.findOne({_id: req.body.topic_id, status: 1});
		if (!MatchBasicTopicData) {
			return res.send(response.error(400, 'Topic is not found', []));
		}

		if (req.body.topic_id == "6151b119edbd9df0de8cfd82") {
			var filtered = req.body.question_answer.filter(function(el) { return el.answer != 0; });
			req.body.question_answer = filtered;
		}

		const MatchBasicUserAnsDeleteData = await MatchBasicUserAns.deleteMany({user_id: req.user._id, topic_id: req.body.topic_id});

		const reqDataArray = req.body.question_answer;

		for (const data in reqDataArray) {
			if (Object.hasOwnProperty.call(reqDataArray, data)) {
				const element = reqDataArray[data];
				element.topic_id = req.body.topic_id;
				element.user_id = req.user._id;
			}
		}

		const MatchBasicUserAnsData = await MatchBasicUserAns.insertMany(reqDataArray);

		return res.send(response.success(200, 'Success', [] ));
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

exports.matchingQueAnsUserList = async (req,res) => {
	try {
		const UserAnsData = await MatchBasicUserAns.find({user_id: req.user._id}).lean();
		const OtherUsersAnsData = await MatchBasicUserAns.find({user_id: { $ne: req.user._id}}).populate({path: 'user_id', match: {status: 1}}).lean();

		let arrayObject = [];
		UserAnsData.forEach(UserAns => { // UserAns.question_id
			OtherUsersAnsData.forEach(OtherUsersAns => { //OtherUsersAns.question_id
				if (String(OtherUsersAns.question_id) == String(UserAns.question_id) && OtherUsersAns.answer == UserAns.answer) {
					if (OtherUsersAns.user_id != null) { //if user details not exists
						let obj = arrayObject.findIndex((obj => String(obj.userData._id) == String(OtherUsersAns.user_id._id)));
						if (obj != -1) {
							arrayObject[obj].total_match_ans = arrayObject[obj].total_match_ans + 1;
							arrayObject[obj].userData.total_match_ans = arrayObject[obj].userData.total_match_ans + 1;
						} else {
							OtherUsersAns.user_id.total_match_ans = 1;
							arrayObject.push({ total_match_ans: 1, userData: OtherUsersAns.user_id });
						}
					}
				}
			});
		});
		
		arrayObject.sort((a, b) => (a.total_match_ans < b.total_match_ans) ? 1 : -1); //highest match count first in array

		let arrayObject2 = [];

		for (let i = 0; i < arrayObject.length; i++) {
			let element = arrayObject[i];
			let total_match_ans_per = 100 * element.total_match_ans / UserAnsData.length;
			delete element.total_match_ans;
			element.userData.total_match_ans_per = total_match_ans_per;
			arrayObject2.push(element.userData);
		}

		let MatchedBasicQueUsers = await MatchedBasicQueUserList.find({user_id: req.user._id}).lean();

		for (let i = 0; i < arrayObject2.length; i++) {
			const element = arrayObject2[i];
			for (let j = 0; j < MatchedBasicQueUsers.length; j++) {
				const element2 = MatchedBasicQueUsers[j];
				if (String(element._id) == String(element2.matched_user_id)) {
					element.matched_status = 1;
				}
			}
			if (element.matched_status == undefined) {
				element.matched_status = 0;
			}
		}

		return res.send(response.success(200, 'Success', UserResource(arrayObject2) ));
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

exports.matchedUserStatus = async (req,res) => {
	try {
		const schema = Joi.object({
			matched_user_id: Joi.objectId().label('matched user id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		let MatchedBasicQueUserListData = await MatchedBasicQueUserList.findOne({user_id: req.user._id, matched_user_id: req.body.matched_user_id});
		if (!MatchedBasicQueUserListData) {
			MatchedBasicQueUserListData = await MatchedBasicQueUserList.create({
				user_id: req.user._id,
				matched_user_id: req.body.matched_user_id,
				matched_status: 1
			});
		}		

		let responseData = {
			_id: MatchedBasicQueUserListData._id,
			user_id: MatchedBasicQueUserListData.user_id,
			matched_user_id: MatchedBasicQueUserListData.matched_user_id,
			matched_status: String(MatchedBasicQueUserListData.matched_status),
		}

		return res.send(response.success(200, 'Success', responseData ));
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

exports.matchedUserDetails = async (req,res) => {
	try {
		const UserAnsData = await MatchBasicUserAns.find({user_id: req.user._id}).lean();
		const OtherUsersAnsData = await MatchBasicUserAns.find({user_id: req.body.matched_user_id}).populate({path: 'topic_id', match: {status: 1}}).populate({path: 'question_id', match: {status: 1}}).lean();
		const MatchedUserDetails = await User.findOne({_id: req.body.matched_user_id, status: 1}).lean();

		let matchedQuestionArrayObject = [];
		UserAnsData.forEach(UserAns => { // UserAns.question_id
			OtherUsersAnsData.forEach(OtherUsersAns => { //OtherUsersAns.question_id
				if (OtherUsersAns.question_id != null) {
					if (String(OtherUsersAns.question_id._id) == String(UserAns.question_id) && OtherUsersAns.answer == UserAns.answer) {
						if (OtherUsersAns.topic_id != null) { //if user details not exists
							let obj = matchedQuestionArrayObject.findIndex((obj => obj.topic == OtherUsersAns.topic_id.title));
							if (obj == -1) {
								matchedQuestionArrayObject.push({
									topic: OtherUsersAns.topic_id.title, 
									topic_icon: OtherUsersAns.topic_id.icon, 
									question_answer: [{ 
										question_id: OtherUsersAns.question_id._id, 
										question: OtherUsersAns.question_id.question, 
										answer: OtherUsersAns.answer == 1 ? OtherUsersAns.question_id.answer_one : OtherUsersAns.question_id.answer_one
									}]
								});
							} else {
								let obj2 = matchedQuestionArrayObject.find(o => o.topic == OtherUsersAns.topic_id.title);
								obj2.question_answer.push({ 
									question_id: OtherUsersAns.question_id._id, 
									question: OtherUsersAns.question_id.question, 
									answer: OtherUsersAns.answer == 1 ? OtherUsersAns.question_id.answer_one : OtherUsersAns.question_id.answer_one 
								});
							}
						}
					}
				}
			});
		});

		MatchedUserDetails.matched_que_ans = matchedQuestionArrayObject;

		return res.send(response.success(200, 'Success', UserResource(MatchedUserDetails) ));
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