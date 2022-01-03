const response = require("../../helper/response");
const console = require("../../helper/console");
const PremiumPlans = require("../../models/PremiumPlans");

exports.storeUpdate = async (req,res) => {
	try {
		const saveRecord = new PremiumPlans({
            title: req.body.title,
            months: req.body.months,
            save_percentage:req.body.save_percentage,
            price_per_month: req.body.price_per_month,
            total_price:req.body.total_price
		});

		if(req.body.premium_plan_id){
			const update = await PremiumPlans.findByIdAndUpdate(req.body.premium_plan_id, {title: req.body.title,months: req.body.months,save_percentage: req.body.save_percentage,price_per_month: req.body.price_per_month,total_price:req.body.total_price}, {new: true, runValidators: true});
		}else{
			const recordData = await saveRecord.save();
		}
		
		return res.send(response.success(200, 'Premium Plans store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.recordList = async (req,res) => {
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
                months:1,
                save_percentage:1,
                price_per_month:1,
                total_price:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['title'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await PremiumPlans.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                title:-1,
                months:+1
            }
        };

		let recordData = await PremiumPlans.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.statusChange = async (req,res) => {
	try {
		if(req.body._id){
			const update = await PremiumPlans.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}