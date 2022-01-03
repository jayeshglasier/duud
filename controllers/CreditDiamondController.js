const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const UserCredit = require('../models/UserCredit');
const UserDiamond = require('../models/UserDiamond');
const User = require('../models/User');
const { emailTransporterConfig } = require('../config/emailConfig');
const ejs = require("ejs");
const BuyCredits = require("../models/BuyCredits");
const BuyCreditsDetails = require("../models/BuyCreditsDetails");

exports.addUserCredits = async (req,res) => {
	try {
		const schema = Joi.object({
			title: Joi.string().trim(true).required().label('title'),
			ref_user_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
			debit_credit_status: Joi.number().label('debit credit status'),
			credits_value: Joi.number().label('credits value'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		if (userData && req.body.debit_credit_status == 0) { //debit_credit_status: 0=debit, 1=credit
			if (userData.credits_value == undefined || userData.credits_value < req.body.credits_value) {
				return res.send(response.error(400, 'insufficient credit balance', [] ));
			}
		}

		const UserCreditData = new UserCredit({
			user_id: req.user._id,
			title: req.body.title,
			ref_user_id: req.body.ref_user_id,
			debit_credit_status: req.body.debit_credit_status,
			credits_value: req.body.credits_value
		});
		await UserCreditData.save();

		if (userData) {
			if (UserCreditData.debit_credit_status == 0) {
				userData.credits_value = parseInt(userData.credits_value ? userData.credits_value : 0) - parseInt(req.body.credits_value);
			} else if(UserCreditData.debit_credit_status == 1) {
				userData.credits_value = parseInt(userData.credits_value ? userData.credits_value : 0) + parseInt(req.body.credits_value);
			}
			await userData.save();
		}
		
		return res.send(response.success(200, 'Success', UserCreditData ));
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

exports.userCreditsHistory = async (req,res) => {
	try {
		const UserCreditData = await UserCredit.find({user_id: req.user._id, status: 1}).sort({created_at: -1}).select('+created_at').lean();

		let ResponseArray = [];
		for (const resData of UserCreditData) {
			resData.credits_value || resData.credits_value== 0 ? resData.credits_value= String(resData.credits_value) : resData.credits_value;
			resData.debit_credit_status == 0 ? resData.credits_value= '-'+resData.credits_value : resData.credits_value= '+'+resData.credits_value;

			ResponseArray.push({
				"_id": resData._id ? resData._id : "",
				"title": resData.title ? resData.title : "",
				"ref_user_id": resData.ref_user_id ? resData.ref_user_id : "",
				"credits_value": resData.credits_value ? resData.credits_value : "0",
				"created_at": resData.created_at ? resData.created_at : "",
			});
		}

		return res.send(response.success(200, 'Success', ResponseArray ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.userCreditsBalance = async (req,res) => {
	try {
		return res.send(response.success(200, 'Success', [{credits_value: req.user.credits_value != undefined ? String(req.user.credits_value) : '0' }] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.addUserDiamonds = async (req,res) => {
	try {
		const schema = Joi.object({
			title: Joi.string().trim(true).required().label('title'),
			ref_user_id: Joi.objectId().label('user id').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`}),
			debit_credit_status: Joi.number().label('debit credit status'),
			diamonds_value: Joi.number().label('credits value'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		if (userData && req.body.debit_credit_status == 0) {
			if (userData.diamonds_value == undefined || userData.diamonds_value < req.body.diamonds_value) {
				return res.send(response.error(400, 'insufficient credit balance', [] ));
			}
		}

		const UserDiamondData = new UserDiamond({
			user_id: req.user._id,
			title: req.body.title,
			ref_user_id: req.body.ref_user_id,
			debit_credit_status: req.body.debit_credit_status,
			diamonds_value: req.body.diamonds_value
		});
		await UserDiamondData.save();

		if (userData) {
			if (UserDiamondData.debit_credit_status == 0) {
				userData.diamonds_value = parseInt(userData.diamonds_value ? userData.diamonds_value : 0) - parseInt(req.body.diamonds_value);
			} else if(UserDiamondData.debit_credit_status == 1) {
				userData.diamonds_value = parseInt(userData.diamonds_value ? userData.diamonds_value : 0) + parseInt(req.body.diamonds_value);
			}
			await userData.save();
		}
		
		return res.send(response.success(200, 'Success', UserDiamondData ));
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

exports.userDiamondsHistory = async (req,res) => {
	try {
		const UserDiamondData = await UserDiamond.find({user_id: req.user._id, status: 1}).lean();

		let ResponseArray = [];
		for (const resData of UserDiamondData) {
			resData.diamonds_value || resData.diamonds_value== 0 ? resData.diamonds_value= String(resData.diamonds_value) : resData.diamonds_value;
			resData.debit_credit_status == 0 ? resData.diamonds_value= '-'+resData.diamonds_value : resData.diamonds_value= '+'+resData.diamonds_value;

			ResponseArray.push({
				"_id": resData._id ? resData._id : "",
				"title": resData.title ? resData.title : "",
				"ref_user_id": resData.ref_user_id ? resData.ref_user_id : "",
				"diamonds_value": resData.diamonds_value ? resData.diamonds_value : "0",
			});
		}

		return res.send(response.success(200, 'Success', ResponseArray ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.userDiamondsBalance = async (req,res) => {
	try {
		return res.send(response.success(200, 'Success', [{credits_value: req.user.diamonds_value != undefined ? String(req.user.diamonds_value) : '0' }] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.transferCreditToUser = async (req,res) => {
	try {
		const schema = Joi.object({
			transfer_user_email: Joi.string().min(6).required().email(),
			credits_value: Joi.number().integer().min(1).label('credits value'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		if (userData && req.body.credits_value > 0) {
			if (userData.credits_value == undefined || userData.credits_value < req.body.credits_value) {
				return res.send(response.error(400, 'insufficient credit balance', [] ));
			}
		}

		const otp = Math.floor(100000 + Math.random() * 900000);
		const transferUserData = await User.findOneAndUpdate({email: req.body.transfer_user_email, status: 1}, {otp: otp, otp_created_at: new Date()}, {new:true,runValidators:true}).select('+otp');
		if (!transferUserData) return res.send(response.error(400, 'email not found', [] ));

		//sending email for Change email
		const transporter = emailTransporterConfig();
		const htmlFile = await ejs.renderFile(__basedir + "/views/email/transferCreditVerification.ejs", { userData: transferUserData, requestByEmail: req.user.email });
		const mailOptions = {
			from: process.env.MAIL_FROM_ADDRESS, 
			to: req.body.transfer_user_email,
			subject: 'Transfer Credit Verification OTP',
			html: htmlFile
		};
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.error('Email sent error: ' + JSON.stringify(error), __filename, req.originalUrl);
			} else {
				console.logs('Email sent success: ' + JSON.stringify(info.envelope) + '\n=> ' + info.response);
			}
			transporter.close();
		});

		return res.send(response.success(200, 'Success', [] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.transferCreditVerifyOtp = async (req,res) => {
	try {
		const schema = Joi.object({
			transfer_user_email: Joi.string().min(6).required().email().label('transfer user email'),
			credits_value: Joi.number().integer().min(1).label('credits value'),
			otp: Joi.number().integer().min(1).label('otp'),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		if (userData && req.body.credits_value > 0) {
			if (userData.credits_value == undefined || userData.credits_value < req.body.credits_value) {
				return res.send(response.error(400, 'insufficient credit balance', [] ));
			}
		}

		const transferUserData = await User.findOne({email: req.body.transfer_user_email, otp_created_at: {$gt: new Date(Date.now() - 100*60 * 1000)}, status: 1 }).select('+otp'); //otp expire within 10min
		if (!transferUserData) return res.send(response.error(400, 'OTP expired', [] ));
		if (transferUserData.otp == null || transferUserData.otp != req.body.otp) {
			return res.send(response.error(400, 'OTP is wrong', [] ));
		}

		//credits credit(-) from auth user id
		const UserCreditData = new UserCredit({
			user_id: req.user._id,
			title: 'credit transfer to '+transferUserData.email,
			ref_user_id: transferUserData._id,
			debit_credit_status: 0, //0=credit(-),1=debit(+)
			credits_value: req.body.credits_value
		});
		await UserCreditData.save();
		const userData1 = await User.findOne({ _id: req.user._id, status: 1 });
		if (userData1) {
			userData1.credits_value = parseInt(userData1.credits_value ? userData1.credits_value : 0) - parseInt(req.body.credits_value);
			await userData1.save();
		}

		//credits debit(-) from transfer_user_email
		const UserCreditData2 = new UserCredit({
			user_id: transferUserData._id,
			title: 'credit transfer by '+req.user.email,
			ref_user_id: req.user._id,
			debit_credit_status: 1, //0=credit(-),1=debit(+)
			credits_value: req.body.credits_value
		});
		await UserCreditData2.save();
		const userData2 = await User.findOne({ _id: transferUserData._id, status: 1 });
		if (userData2) {
			userData2.credits_value = parseInt(userData2.credits_value ? userData2.credits_value : 0) + parseInt(req.body.credits_value);
			await userData2.save();
		}
		
		return res.send(response.success(200, 'Success', [userData.credits_value, userData2.credits_value] ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}

exports.addFreeCreditStore = async (req,res) => {
	try {
		let credits_value = 10; //this value by admin

		const UserCreditData = new UserCredit({
			user_id: req.user._id,
			title: "Watch video",
			debit_credit_status: 1,
			credits_value: credits_value
		});
		await UserCreditData.save();

		const userData = await User.findOne({ _id: req.user._id, status: 1 });
		userData.credits_value = parseInt(userData.credits_value ? userData.credits_value : 0) + parseInt(credits_value);
		await userData.save();
		
		return res.send(response.success(200, 'Success', UserCreditData ));
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

exports.buyCreditPlanList = async (req,res) => {
	try {
		const BuyCreditsData = await BuyCredits.find({status: 1}).lean();
		const BuyCreditsDetailsData = await BuyCreditsDetails.find({status: 1}).lean();

		let arrayTest = [];
		for (let i = 0; i < BuyCreditsData.length; i++) {
			const element1 = BuyCreditsData[i];
			element1.plans = [];
			for (let j = 0; j < BuyCreditsDetailsData.length; j++) {
				const element2 = BuyCreditsDetailsData[j];
				if (String(element1._id) == String(element2.buy_credit_id)) {
					element1.plans.push({
						_id: element2._id,
						buy_credit_id: element2.buy_credit_id ? element2.buy_credit_id : "",
						credit_value: element2.credit_value ? String(element2.credit_value) : "",
						extra_credit_detail: element2.extra_credit_detail ? element2.extra_credit_detail : "",
						save_percentage: element2.save_percentage ? String(element2.save_percentage) : "",
						credit_price: element2.credit_price ? String(element2.credit_price) : "",
					});
				}
			}
		}

		return res.send(response.success(200, 'Success', BuyCreditsData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}