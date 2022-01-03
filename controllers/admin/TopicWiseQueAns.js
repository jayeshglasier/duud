const response = require("../../helper/response");
const console = require("../../helper/console");
const MatchBasicTopicQue = require("../../models/MatchBasicTopicQue");

exports.storeUpdate = async (req,res) => {
	try {
		if (req.body.question.trim() == "" || req.body.question == null) {
			return res.send(response.error(400, 'Question must be required', []));
        }
        
        if (req.body.answer_one.trim() == "" || req.body.answer_one == null) {
			return res.send(response.error(400, 'Answer 1 must be required', []));
        }
        
        if (req.body.answer_two.trim() == "" || req.body.answer_two == null) {
			return res.send(response.error(400, 'Answer 2 must be required', []));
        }
        
		const saveRecord = new MatchBasicTopicQue({
			question: req.body.question,
			answer_one: req.body.answer_one,
			answer_two: req.body.answer_two,
			topic_id: req.body.topic_id,
		});

		if(req.body.topic_que_id){
			const update = await MatchBasicTopicQue.findByIdAndUpdate(req.body.topic_que_id, {question: req.body.question,answer_one: req.body.answer_one,answer_two: req.body.answer_two,topic_id: req.body.topic_id}, {new: true, runValidators: true});
		}else{

			const exists = await MatchBasicTopicQue.exists({ question: req.body.question });
			if (exists) {
				return res.send(response.error(400, 'Question is already exists', []));
			}
			const storeData = await saveRecord.save();
		}
		
		return res.send(response.success(200, 'Question store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.basicTopicQueAnsList = async (req,res) => {
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
				answer_one:1,
				answer_two:1,
                status:1,
                topic_id:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['question'] = {$regex: new RegExp(req.body.search, 'i')};
		}

		let aggregateQuery = {
            $match: {
                topic_id: require('mongoose').Types.ObjectId(req.body.topic_id)
            }
        };
		let totalRecords = await MatchBasicTopicQue.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let dataRecord = await MatchBasicTopicQue.aggregate([search,sort,skip,limit,project,aggregateQuery]);
		return res.send(response.success(200, 'success', dataRecord));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.statusChange = async (req,res) => {
	try {
		if(req.body._id){
			const updateRecord = await MatchBasicTopicQue.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}