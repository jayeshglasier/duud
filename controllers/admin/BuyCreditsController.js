const response = require("../../helper/response");
const console = require("../../helper/console");
const BuyCredits = require("../../models/BuyCredits");

exports.buyCreditsStoreUpdate = async (req,res) => {
	try {
		if (req.body.title.trim() == "" || req.body.title == null) {
			return res.send(response.error(400, 'Title must be required', []));
		}
		const exists = await BuyCredits.exists({ title: req.body.title });
		if (exists) {
			return res.send(response.error(400, 'Title is already exists', []));
		}
		const recordSave = new BuyCredits({
			title: req.body.title
		});

		if(req.body.buy_credit_id){
			const update = await BuyCredits.findByIdAndUpdate(req.body.buy_credit_id, {title: req.body.title}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Buy title store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.buyCreditsList = async (req,res) => {
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
		let totalRecords = await BuyCredits.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await BuyCredits.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.buyCreditsStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await BuyCredits.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}