const response = require("../../helper/response");
const console = require("../../helper/console");
const DiamondsCreditsReward = require("../../models/DiamondsCreditsReward");

exports.storeUpdate = async (req,res) => {
	try {
		const saveRecord = new DiamondsCreditsReward({
            reward_type: req.body.reward_type,
            credits_cash: req.body.credits_cash,
            diamonds: req.body.diamonds
		});

		if(req.body.diamonds_credits_id){
			const update = await DiamondsCreditsReward.findByIdAndUpdate(req.body.diamonds_credits_id, {reward_type: req.body.reward_type,credits_cash: req.body.credits_cash,diamonds: req.body.diamonds}, {new: true, runValidators: true});
		}else{
			const recordData = await saveRecord.save();
		}
		
		return res.send(response.success(200, 'Diamonds store successfully', []));
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
				reward_type:1,
				credits_cash:1,
				diamonds:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['reward_type'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await DiamondsCreditsReward.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                reward_type:-1,
                credits_cash:+1
            }
        };

		let recordData = await DiamondsCreditsReward.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.statusChange = async (req,res) => {
	try {
		if(req.body._id){
			const update = await DiamondsCreditsReward.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}