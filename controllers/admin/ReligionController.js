const response = require("../../helper/response");
const console = require("../../helper/console");
const Religion = require("../../models/Religion");

exports.religionstoreUpdate = async (req,res) => {
	try {
		if (req.body.religion_name.trim() == "" || req.body.religion_name == null) {
			return res.send(response.error(400, 'Religion must be required', []));
		}
		const exists = await Religion.exists({ religion_name: req.body.religion_name });
		if (exists) {
			return res.send(response.error(400, 'Religion is already exists', []));
		}
		const recordSave = new Religion({
			religion_name: req.body.religion_name
		});

		if(req.body.religion_id){
			const update = await Religion.findByIdAndUpdate(req.body.religion_id, {religion_name: req.body.religion_name}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Religion store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.religionList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
				religion_name:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['religion_name'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await Religion.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await Religion.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.religionStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await Religion.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}