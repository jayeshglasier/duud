const response = require("../../helper/response");
const console = require("../../helper/console");
const ProfileQuestion = require("../../models/ProfileQuestion");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

exports.profileQuestionStoreUpdate = async (req,res) => {
	try {
		if (req.body.question.trim() == "" || req.body.question == null) {
			return res.send(response.error(400, 'Language Name must be required', []));
		}

		if (req.body.suggestions.trim() == "" || req.body.suggestions == null) {
			return res.send(response.error(400, 'Language Name must be required', []));
		}

		if(req.body.question_id)
		{
			const question = await ProfileQuestion.findByIdAndUpdate(req.body.question_id, {question: req.body.question, suggestions: req.body.suggestions}, {new: true, runValidators: true});
		}else{
			const existsProfileQuestion = await ProfileQuestion.exists({ question: req.body.question });
			if (existsProfileQuestion) {
				return res.send(response.error(400, 'Question is already exists', []));
			}

			const profileQuestion = new ProfileQuestion({
				question: req.body.question,
				suggestions: req.body.suggestions
			});
			const profileQuestionData = await profileQuestion.save();
		}
		
		return res.send(response.success(200, 'success',[] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileQuestionList = async (req,res) => {
	try {
		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
				question:1,
				suggestions:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['question'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await ProfileQuestion.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let ProfileQuestionData = await ProfileQuestion.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', ProfileQuestionData));

	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.profileQuestionStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await ProfileQuestion.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}
