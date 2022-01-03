const response = require("../../helper/response");
const console = require("../../helper/console");
const ProfileLanguage = require("../../models/ProfileLanguage");

exports.languageStoreUpdate = async (req,res) => {
	try {
		if (req.body.language_name.trim() == "" || req.body.language_name == null) {
			return res.send(response.error(400, 'Language Name must be required', []));
		}
		const exists = await ProfileLanguage.exists({ language_name: req.body.language_name });
		if (exists) {
			return res.send(response.error(400, 'Language Name is already exists', []));
		}
		const recordSave = new ProfileLanguage({
			language_name: req.body.language_name
		});

		if(req.body.language_id){
			const update = await ProfileLanguage.findByIdAndUpdate(req.body.language_id, {language_name: req.body.language_name}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Language store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.languageList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
				language_name:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['language_name'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await ProfileLanguage.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await ProfileLanguage.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.languageStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await ProfileLanguage.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}