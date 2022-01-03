const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const PremiumPlans = require('../models/PremiumPlans');
const UserPremiumPlan = require('../models/UserPremiumPlan');
const PremiumPlansResource = require('../controllers/resources/PremiumPlansResource');

exports.premiumPlansList = async (req,res) => {
	try {
		let premiumPlansData = await PremiumPlans.find({status: 1}).sort({created_at: -1}).lean();

		const UserPremiumPlanExists = await UserPremiumPlan.findOne({user_id: req.user._id, status: 1});

		for (let i = 0; i < premiumPlansData.length; i++) {
			const element = premiumPlansData[i];
			if (String(element._id) == String(UserPremiumPlanExists.premium_plan_id)) {
				element.plan_active_status = 1;
				element.plan_expiry_date = UserPremiumPlanExists.end_date;
			} else {
				element.plan_active_status = 0;
				element.plan_expiry_date = '';
			}
		}

		return res.send(response.success(200, 'Success', PremiumPlansResource(premiumPlansData) ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.buyUserPremiumPlan = async (req,res) => {
	try {
		const schema = Joi.object({
			premium_plan_id: Joi.objectId().label('premium plan id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const PremiumPlansExists = await PremiumPlans.findOne({_id: req.body.premium_plan_id, status: 1});
		if (!PremiumPlansExists) return res.send(response.error(400, 'Plan not found', [] ));

		let expiryDate = new Date();
		expiryDate.setMonth(expiryDate.getMonth() + 3);

		await UserPremiumPlan.updateMany({user_id: req.user._id, status: 1}, {status: 0}); //update user old plan deactivate

		const UserPremiumPlanData = new UserPremiumPlan({
			user_id: req.user._id,
			premium_plan_id: req.body.premium_plan_id,
			start_date: new Date(),
			end_date: expiryDate,
		});
		await UserPremiumPlanData.save();

		return res.send(response.success(200, 'Success', UserPremiumPlanData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}