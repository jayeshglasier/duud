const response = require("../../helper/response");
const console = require("../../helper/console");
const Reporting = require("../../models/Reporting");

exports.reportingStoreUpdate = async (req,res) => {
	try {
		if (req.body.title.trim() == "" || req.body.title == null) {
			return res.send(response.error(400, 'Title must be required', []));
		}
		const exists = await Reporting.exists({ title: req.body.title });
		if (exists) {
			return res.send(response.error(400, 'Title is already exists', []));
		}
		const recordSave = new Reporting({
			title: req.body.title
		});

		if(req.body.reporting_id){
			const update = await Reporting.findByIdAndUpdate(req.body.reporting_id, {title: req.body.title}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Reporting store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.reportingList = async (req,res) => {
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
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['title'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await Reporting.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await Reporting.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.reportingStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await Reporting.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}