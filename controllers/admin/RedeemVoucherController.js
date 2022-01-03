const response = require("../../helper/response");
const console = require("../../helper/console");
const RedeemVoucher = require("../../models/RedeemVoucher");

exports.redeemVoucherStoreUpdate = async (req,res) => {
	try {
		if (req.body.title.trim() == "" || req.body.title == null) {
			return res.send(response.error(400, 'Title must be required', []));
		}
		
		const recordSave = new RedeemVoucher({
            title: req.body.title,
            voucher_code: req.body.voucher_code,
            credits_value: req.body.credits_value,
            voucher_start_date: req.body.voucher_start_date,
            voucher_end_date: req.body.voucher_end_date,
        });

		if(req.body.voucher_id){
			const update = await RedeemVoucher.findByIdAndUpdate(req.body.voucher_id, {
                title: req.body.title,
                voucher_code: req.body.voucher_code,
                credits_value: req.body.credits_value,
                voucher_start_date: req.body.voucher_start_date,
                voucher_end_date: req.body.voucher_end_date,
            }, {new: true, runValidators: true});
		}else{
            const exists = await RedeemVoucher.exists({ title: req.body.title });
            if (exists) {
                return res.send(response.error(400, 'Redeem voucher is already exists', []));
            }
			const recordsData = await recordSave.save();
		}
		return res.send(response.success(200, 'Redeem voucher store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.redeemVoucherList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
                title: 1,
                voucher_code: 1,
                credits_value: 1,
                voucher_start_date: 1,
                voucher_end_date: 1,
                status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['title'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await RedeemVoucher.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await RedeemVoucher.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.redeemVoucherStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const update = await RedeemVoucher.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}