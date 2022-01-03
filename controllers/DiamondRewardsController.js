const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/User');
const DiamondsCreditsReward = require('../models/DiamondsCreditsReward');

exports.diamondRewardsIndex = async (req,res) => {
	try {
		// res.locals.error = req.session != undefined && req.session.error != undefined ? req.session.error : '';
		// req.session = undefined;

		// const _id = decrypt(req.params.key, req.params.id);
		// const userData = await User.findOne({ _id: _id, status: 1 });
		// if (userData && userData.reset_password_status == 1) {
		// 	return res.render('auth/resetPassword', { key: req.params.key, id: req.params.id });
		// } else {
		// 	return res.render('errors/main',{ code: 400, errorMessage: 'Data Not found'});
		// }

		return res.render('web_view/diamond-rewards-index');
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.render('auth/resetPassword', { key: req.params.key, id: req.params.id, error: errorMessage.message })
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.render('errors/main',{ code: 500, errorMessage: 'Something want wrong, Please try again.'})
		}
	}
}

exports.diamondToCreditRewards = async (req,res) => {
	try {
		let data = await DiamondsCreditsReward.find({reward_type: 'credits', status: 1}).sort({credits_cash: 1});

		return res.render('web_view/diamond-to-credit-rewards', {data: data});
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.diamondToCashRewards = async (req,res) => {
	try {
		let data = await DiamondsCreditsReward.find({reward_type: 'cash', status: 1}).sort({credits_cash: 1});

		return res.render('web_view/diamond-to-cash-rewards', {data: data});
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.cashRewardsHistory = async (req,res) => {
	try {
		let DiamondsCreditsRewardData = await DiamondsCreditsReward.find({status: 1});

		return res.render('web_view/cash-rewards-history');
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}