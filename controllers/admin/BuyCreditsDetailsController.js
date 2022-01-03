const response = require("../../helper/response");
const console = require("../../helper/console");
const BuyCreditsDetails = require("../../models/BuyCreditsDetails");

exports.buyCreditsStoreUpdate = async (req,res) => {
	try {
		if (req.body.buy_credit_id.trim() == "" || req.body.buy_credit_id == null) {
			return res.send(response.error(400, 'buy_credit_id must be required', []));
		}
		const recordSave = new BuyCreditsDetails({
			buy_credit_id: req.body.buy_credit_id,
			credit_value: req.body.credit_value,
			extra_credit_detail: req.body.extra_credit_detail,
			save_percentage: req.body.save_percentage,
			credit_price: req.body.credit_price
		});

		if(req.body.buy_credit_details_id){
			const update = await BuyCreditsDetails.findByIdAndUpdate(req.body.buy_credit_details_id, {
				credit_value: req.body.credit_value,
				extra_credit_detail: req.body.extra_credit_detail,
				save_percentage: req.body.save_percentage,
				credit_price: req.body.credit_price
			}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Buy credit details store successfully', []));
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
				buy_credit_id:1,
				credit_value:1,
				extra_credit_detail:1,
				save_percentage:1,
				credit_price:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['credit_value'] = {$regex: new RegExp(req.body.search, 'i')};
		}

		let aggregateQuery = {
            $match: {
                buy_credit_id: require('mongoose').Types.ObjectId(req.body.buy_credit_id)
            }
		};
		
		let totalRecords = await BuyCreditsDetails.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await BuyCreditsDetails.aggregate([search,sort,skip,limit,project,aggregateQuery]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.buyCreditsStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await BuyCreditsDetails.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}