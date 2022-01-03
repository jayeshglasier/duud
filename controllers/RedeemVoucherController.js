const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const RedeemVoucher = require('../models/RedeemVoucher');
const UserRedeemVoucher = require('../models/UserRedeemVoucher');
const UserCredit = require('../models/UserCredit');
const User = require('../models/User');

exports.storeRedeemVoucher = async (req,res) => {
	try {
		const schema = Joi.object({
			voucher_code: Joi.string().trim(true).required().label('voucher code')
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const RedeemVoucherExists = await RedeemVoucher.findOne({voucher_code: req.body.voucher_code}); //
		if (!RedeemVoucherExists) return res.send(response.error(400, 'Voucher not exists', [] ));

		const RedeemVoucherData = await RedeemVoucher.findOne({voucher_code: req.body.voucher_code, voucher_start_date: {$lte: new Date()}, voucher_end_date: {$gte: new Date()} }); //
		if (!RedeemVoucherData) return res.send(response.error(400, 'Voucher expired', [] ));

		const existsUserRedeemVoucher = await UserRedeemVoucher.findOne({user_id: req.user._id, voucher_id: RedeemVoucherData._id});
		if (existsUserRedeemVoucher) {
			return res.send(response.error(400, 'Voucher already Redeemed', [] ));
		}

		const UserRedeemVoucherData = new UserRedeemVoucher({
			user_id: req.user._id,
			voucher_id: RedeemVoucherData._id,
		});
		await UserRedeemVoucherData.save();

		let credits_value = RedeemVoucherData.credits_value; //this value by admin
		const UserCreditData = new UserCredit({
			user_id: req.user._id,
			title: "Redeem Voucher: "+ RedeemVoucherData.voucher_code,
			debit_credit_status: 1,
			credits_value: credits_value
		});
		await UserCreditData.save();
		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		userData.credits_value = parseInt(userData.credits_value ? userData.credits_value : 0) + parseInt(credits_value);
		await userData.save();

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}