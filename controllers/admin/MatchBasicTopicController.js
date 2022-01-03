const response = require("../../helper/response");
const console = require("../../helper/console");
const MatchBasicTopic = require("../../models/MatchBasicTopic");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const path = require("path");

exports.basicTopicStoreUpdate = async (req,res) => {
	try {
		if (req.body.title.trim() == "" || req.body.title == null) {
			return res.send(response.error(400, 'Title must be required', []));
		}

		if(req.body.topic_id)
		{
			if (req.files) {
				let media_file = req.files.media_file;
				let uploadPath = __basedir + '/public/uploads/match_basic_topic_icons/';
				let fileName;
	
				if (media_file) {
					if (media_file.mimetype !== "image/png" && media_file.mimetype !== "image/jpg" && media_file.mimetype !== "image/jpeg"){
						return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
					}
					if (media_file.size >= (1024 * 1024 * 5)) { // if getter then 5MB
						return res.send(response.error(400, 'Image must be less then 5MB', []));
					}
					fileName = 'topic-icon-' + Date.now() + path.extname(media_file.name);
					media_file.mv(uploadPath + fileName, function(err) {
						if (err){
							return res.send(response.error(400, 'Image uploading failed', []));
						}
					});
					req.body.icon = 'public/uploads/match_basic_topic_icons/' + fileName;
					}
				}

				const matchBasicTopicData = await MatchBasicTopic.findByIdAndUpdate(req.body.topic_id, req.body, {new: true, runValidators: true});
		
				return res.send(response.success(200, 'success', matchBasicTopicData ));
			}else
			{
				if (req.files) {
					let media_file = req.files.media_file;
					let uploadPath = __basedir + '/public/uploads/match_basic_topic_icons/';
					let fileName;
		
					if (media_file) {
						if (media_file.mimetype !== "image/png" && media_file.mimetype !== "image/jpg" && media_file.mimetype !== "image/jpeg"){
							return res.send(response.error(400, 'File format should be PNG,JPG,JPEG', []));
						}
						if (media_file.size >= (1024 * 1024 * 5)) { // if getter then 5MB
							return res.send(response.error(400, 'Image must be less then 5MB', []));
						}
						fileName = 'topic-icon-' + Date.now() + path.extname(media_file.name);
						media_file.mv(uploadPath + fileName, function(err) {
							if (err){
								return res.send(response.error(400, 'Image uploading failed', []));
							}
						});
						req.body.media_file = 'public/uploads/match_basic_topic_icons/' + fileName;
					}
				}else{
					return res.send(response.error(400, 'Icon must be required', []));
				}
				
				const existsMatchBasicTopic = await MatchBasicTopic.exists({ title: req.body.title });
				if (existsMatchBasicTopic) {
					return res.send(response.error(400, 'Title is already exists', []));
				}
		
				const matchBasicTopic = new MatchBasicTopic({
					title: req.body.title,
					icon: req.body.media_file
				});
				const matchBasicTopicData = await matchBasicTopic.save();
		
				return res.send(response.success(200, 'success', matchBasicTopicData ));
		
			}
		} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.basicTopicList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
				title:1,
				icon:1,
				status:1,
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['title'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await MatchBasicTopic.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let matchBasicTopicData = await MatchBasicTopic.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', matchBasicTopicData));

	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.basicTopicStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await MatchBasicTopic.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}