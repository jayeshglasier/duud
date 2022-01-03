const response = require("../../helper/response");
const console = require("../../helper/console");
const AdminSetting = require("../../models/AdminSetting");

exports.adminSettingStoreUpdate = async (req,res) => {
	try {
		if (req.body.free_credit_value.trim() == "" || req.body.free_credit_value == null) {
			return res.send(response.error(400, 'Credit value must be required', []));
		}
		const exists = await AdminSetting.exists({ free_credit_value: req.body.free_credit_value });
		if (exists) {
			return res.send(response.error(400, 'Credit value is already exists', []));
		}
		const recordSave = new AdminSetting({
			free_credit_value: req.body.free_credit_value
		});

		if(req.body.language_id){
			const update = await AdminSetting.findByIdAndUpdate(req.body.language_id, {free_credit_value: req.body.free_credit_value}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Credit value store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.adminSettingList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
				free_credit_value:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['free_credit_value'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await AdminSetting.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await AdminSetting.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.languageStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await AdminSetting.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}