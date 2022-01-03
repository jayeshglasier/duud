const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { encrypt, decrypt } = require('../helper/crypto');
const { emailTransporterConfig } = require('../config/emailConfig');
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const response = require("../helper/response");
const commonHelpers = require("../helper/commonHelpers");
const console = require("../helper/console");
const UserResource = require('./resources/UserResource');
const ejs = require("ejs");

exports.register = async (req, res) => {
	try {
		const schema = Joi.object({
			email: Joi.string().min(6).required().email(),
			password: Joi.string().min(6).required(),
			device_type: Joi.number().integer().valid(1,2,3).required(),
			device_token: Joi.string().min(6).required(),
			firebase_id: Joi.string().allow('',null).trim(true).label('firebase id'), //.allow('',null)
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const existsUser = await User.findOne({ email: req.body.email });
		if(existsUser) {
			return res.send(response.error(400, 'email id already exists', [] ));
		}

		const registerUser = new User({
			email: req.body.email,
			password: req.body.password,
			device_type: req.body.device_type,
			device_token: req.body.device_token,
			firebase_id: req.body.firebase_id,
		});
		let registerUserData = await registerUser.save();
		registerUserData = JSON.parse(JSON.stringify(registerUserData));
		delete registerUserData.password;

		const token = await registerUser.generatingAuthToken(); // generate token
		registerUserData.token = token; // added token in user document

		await User.findOneAndUpdate({_id: registerUserData._id}, {tokens: [{token: token, signedAt: new Date() }] }); //store tokens

		const encryptedId = encrypt(registerUserData._id);
		const emailVerifyUrl = req.protocol + '://' + req.get('host') + process.env.BASE_URL + 'verify-email/'+ encryptedId.key + '/' + encryptedId.id;

		//sending email for registration success
		const transporter = emailTransporterConfig();
		const htmlFile = await ejs.renderFile(__basedir + "/views/email/verifyEmail.ejs", { UserName: registerUserData, emailVerifyUrl: emailVerifyUrl });
		const mailOptions = {
			from: process.env.MAIL_FROM_ADDRESS,
			to: registerUserData.email,
			subject: 'Verify Your Email',
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

		return res.send(response.success(200, 'Registration Success', UserResource(registerUserData)));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', [] ));
		}
	}
}

exports.verifyEmailCallback = async (req, res) => {
	try {
		const _id = decrypt(req.params.key, req.params.id);
		const userData = await User.findOne({ _id: _id, email_verified_status: 0, status: 1 });
		if (userData) {
			const updateUser = await User.findOneAndUpdate({_id: _id}, {email_verified_status: 1}, {new:true,runValidators:true} );
			return res.redirect(req.baseUrl + '/verified-email-success');
		} else {
			return res.redirect(req.baseUrl + '/404');
			// return res.render('errors/main',{ code: 404, errorMessage: 'Data Not found'})
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.verifiedEmailSuccess = async (req, res) => {
	return res.render('auth/verifyEmailSuccess');
}

exports.login = async (req, res) => {
	try {
		const schema = Joi.object({
			email: Joi.string().min(6).required().email(),
			password: Joi.string().min(6).required(),
			device_type: Joi.number().integer().valid(1,2,3).required(),
			device_token: Joi.string().min(6).required(),
			build_version: Joi.string().max(6).allow('',null),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		let userData = await User.findOne({email: req.body.email, status: 1}).select("+password");
		if (userData && userData.password) {
			// if (userData.email_verified_status == 0) {
			// 	return res.send(response.error(400, 'email not verified, please check email', [] ));
			// }

			const isMatch = await bcrypt.compare(req.body.password, userData.password);
			if (isMatch) {
				let UpdateDeviceToken = await User.updateOne({ _id: userData._id }, {device_type: req.body.device_type, device_token: req.body.device_token, build_version: req.body.build_version}); //update device token
				const token = await userData.generatingAuthToken(); // generate token
				// userData = JSON.parse(JSON.stringify(userData));
				userData.token = token; // add token in user document

				oldTokens = userData.tokens || []; //get old tokens
				oldTokens = oldTokens.slice(Math.max(oldTokens.length - 4, 0)); //get last 4 tokens
				await User.findOneAndUpdate({_id: userData._id}, {tokens: [...oldTokens ,{token: token, signedAt: new Date()}] }, {new:true,runValidators:true}); //update add new tokens

				delete userData['password']; // remove password in user data
				delete userData['question_answer'];
				// userData.profile_per = commonHelpers.userProfilePer(userData);

				return res.send(response.success(200, 'Login Success', UserResource(userData) ));
			} else {
				return res.send(response.error(400, 'Login Failed. Incorrect email or password', [] ));
			}
		} else {
			return res.send(response.error(400, 'Login Failed. Incorrect email or password', [] ));
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.socialLoginCallback = async (req, res) => {
	try {
		const schema = Joi.object({
			social_id: Joi.string().required(),
			social_type: Joi.number().integer().valid(1,2,3).required(),
			device_type: Joi.number().integer().valid(1,2,3).required(),
			device_token: Joi.string().min(6).required(),
			name: Joi.string().allow('',null),
			phone: Joi.number().integer().allow('',null),
			email: Joi.string().allow('',null),
			build_version: Joi.string().max(6).allow('',null),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			return res.send(response.error(400, validation.error.details[0].message, [] ));
		}

		const userData = await User.findOne({ social_id: req.body.social_id });
		if (userData) {
			if (userData.status != 1) {
				return res.send(response.error(400, 'User is inactive by admin', []));
			}

			let updateUser = await User.findOneAndUpdate({ _id: userData._id }, { social_id: req.body.social_id, social_type: req.body.social_type, device_type: req.body.device_type, device_token: req.body.device_token, build_version: req.body.build_version }, {new:true,runValidators:true});
			const token = await userData.generatingAuthToken(); // generate token
			// updateUser = JSON.parse(JSON.stringify(updateUser));
			updateUser.token = token; // add token in user document

			oldTokens = userData.tokens || []; //get old tokens
			oldTokens = oldTokens.slice(Math.max(oldTokens.length - 4, 0)); //get last 4 tokens
			await User.findOneAndUpdate({_id: userData._id}, {tokens: [...oldTokens ,{token: token, signedAt: new Date()}] }); //update add new tokens

			delete userData['question_answer'];
			return res.send(response.success(200, 'Login Success with already exists user', UserResource(updateUser)));
		} else {
			if (req.body.email) {
				const existsUser = await User.findOne({ email: req.body.email });
				if (existsUser) {
					if (existsUser.status != 1) {
						return res.send(response.error(400, 'User is inactive by admin', []));
					}
					let updateUser = await User.findOneAndUpdate({ _id: existsUser._id }, { social_id: req.body.social_id, social_type: req.body.social_type, device_type: req.body.device_type, device_token: req.body.device_token, build_version: req.body.build_version }, {new:true,runValidators:true});
					const token = await existsUser.generatingAuthToken(); // generate token
					updateUser.token = token; // add token in user document

					oldTokens = existsUser.tokens || []; //get old tokens
					oldTokens = oldTokens.slice(Math.max(oldTokens.length - 4, 0)); //get last 4 tokens
					await User.findOneAndUpdate({_id: existsUser._id}, {tokens: [...oldTokens ,{token: token, signedAt: new Date()}] }); //update add new tokens

					delete existsUser['question_answer'];
					return res.send(response.success(200, 'Login Success with already exists user', UserResource(updateUser)));
				}
			}
			const registerUser = new User({
				name: req.body.name,
				phone: req.body.phone,
				email: req.body.email,
				social_id: req.body.social_id,
				social_type: req.body.social_type,
				device_type: req.body.device_type,
				device_token: req.body.device_token,
				email_verified_status: 1
			});
			const registeredData = await registerUser.save();

			const token = await registerUser.generatingAuthToken(); // generate token
			await User.findOneAndUpdate({_id: registeredData._id}, {tokens: [{token: token, signedAt: new Date() }] }); //store tokens

			const userDataJson = JSON.parse(JSON.stringify(registeredData));
			userDataJson.token = token; // added token in user document
			
			return res.send(response.success(200, 'Login Success with New registration', UserResource(userDataJson)));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(400, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', [] ));
		}
	}
}

exports.forgotPassword = async (req, res) => {
	try {
		const email = req.body.email;
		const userData = await User.findOne({ email: email });

		if (userData) {
			if (userData.status != 1) {
				return res.send(response.error(400, 'User is inactive by admin', []));
			}

			const transporter = emailTransporterConfig();

			const encryptedId = encrypt(""+userData._id+"");
			const ResetPasswordUrl = req.protocol + '://' + req.get('host') + process.env.BASE_URL + 'reset-password/'+ encryptedId.key + '/' + encryptedId.id;
			const htmlFile = await ejs.renderFile(__basedir + "/views/email/forgotPassword.ejs", { ResetPasswordUrl: ResetPasswordUrl, UserName: userData.name });
			const mailOptions = {
				from: process.env.MAIL_FROM_ADDRESS,
				to: userData.email,
				subject: 'Reset Your Password',
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

			await User.findOneAndUpdate({_id: userData._id}, {reset_password_status: 1}, {new:true,runValidators:true});
			return res.send(response.success(200, 'Email Send Successfully', [] ));
		} else {
			return res.send(response.error(400, 'Email not found', [] ));
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.resetPasswordWeb = async (req, res) => {
	res.locals.error = req.session != undefined && req.session.error != undefined ? req.session.error : '';

	const _id = decrypt(req.params.key, req.params.id);
	const userData = await User.findOne({ _id: _id, status: 1 });
	if (userData && userData.reset_password_status == 1) {
		return res.render('auth/resetPassword', { key: req.params.key, id: req.params.id });
	} else if(userData && userData.reset_password_status == 0) {
		return res.render('errors/main',{ code: 400, errorMessage: 'Link is expired, Please Try Again'});
	} else {
		return res.render('errors/main',{ code: 400, errorMessage: 'Data Not found'});
	}
}

exports.resetPassword = async (req, res) => {
	try {
		const schema = Joi.object({
			password: Joi.string().min(6).max(15).required().label('Password'),
			confirm_password: Joi.any().equal(Joi.ref('password')).required().label('Confirm password')
				.messages({'any.only': '{{#label}} does not match'})
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) {
			req.session.error = validation.error.details[0].message;
			return res.redirect('back');
		} else {
			req.session.error = '';
		}

		const _id = decrypt(req.params.key, req.params.id);
		const userData = await User.findOne({ _id: _id, status: 1 });
		if (userData && userData.reset_password_status == 1) {
			const userData = await User.findOneAndUpdate({_id: _id}, {password: req.body.password, reset_password_status: 0}, {new:true,runValidators:true});

			//sending email for Change Password
			const transporter = emailTransporterConfig();
			const htmlFile = await ejs.renderFile(__basedir + "/views/email/changePassword.ejs", { UserName: userData.name });
			const mailOptions = {
				from: process.env.MAIL_FROM_ADDRESS,
				to: userData.email,
				subject: 'Change Password Success',
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

			return res.redirect(req.baseUrl + '/reset-password-success');
		} else {
			return res.render('errors/main',{ code: 404, errorMessage: 'Data Not found'})
		}
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

exports.resetPasswordSuccess = async (req, res) => {
	return res.render('auth/resetPasswordSuccess');
}

exports.error404 = async (req, res) => {
	return res.render('errors/main',{ code: 404, errorMessage: 'Data Not found'})
	// return res.render('auth/resetPasswordSuccess');
}

exports.logout = async (req, res) => {
	const token = req.user.token;
	const tokens = req.user.tokens;
	const newTokens = tokens.filter(t => t.token !== token);
	await User.findOneAndUpdate({_id: req.user._id}, {tokens: newTokens});

	return res.send(response.success(200, 'logout Successfully', [] ));
}