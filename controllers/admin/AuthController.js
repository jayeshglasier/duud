const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../../models/AdminUser");
const response = require("../../helper/response");
const commonHelpers = require("../../helper/commonHelpers");
const console = require("../../helper/console");

exports.login = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		let userData = await AdminUser.findOne({ email: email }).select("+password");
		if (userData && userData.password) {
			const isMatch = await bcrypt.compare(password, userData.password);
			if (isMatch) {
				const token = await userData.generatingAdminAuthToken(); // generate token
				userData = JSON.parse(JSON.stringify(userData));
				userData.token = token; // add token in user document
				delete userData['password']; // remove password in user data

				return res.send(response.success(200, 'Login Success', userData ));
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

exports.verifyToken = async (req, res) => {
	try {
		const token = req.body.token;

		const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
		let adminUserData = await AdminUser.findOne({_id: verifyUser._id});

		return res.send(response.success(200, 'Token verify success!'));

	} catch(error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.updateAdminProfile = async (req, res) => {
	try {
		if (req.body.name.trim() == "" || req.body.name == null) {
			return res.send(response.error(400, 'Name must be required', []));
		}

		if (req.body.email.trim() == "" || req.body.email == null) {
			return res.send(response.error(400, 'Email must be required', []));
		}
	
		if(req.body.admin_id){
			const update = await AdminUser.findByIdAndUpdate(req.body.admin_id, {name: req.body.name,email: req.body.email}, {new: true, runValidators: true});
		}else{
			return res.send(response.error(500, 'Something want wrong :(', [] ));
		}
		let userData = await AdminUser.findOne({ _id: req.body.admin_id });
		const token = await userData.generatingAdminAuthToken(); // generate token
		userData = JSON.parse(JSON.stringify(userData));
		userData.token = token; // add token in user document
		delete userData['password']; // remove password in user data

		
		return res.send(response.success(200, 'User details update successfully', userData));

	} catch(error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.adminChangePassword = async (req, res) => {
	try {
		if (req.body.old_password.trim() == "" || req.body.old_password == null) {
			return res.send(response.error(400, 'Old password must be required', []));
		}

		if (req.body.password.trim() == "" || req.body.password == null) {
			return res.send(response.error(400, 'Password must be required', []));
		}

		const userData = await AdminUser.findOne({ _id: req.body.admin_id, status: 1 }).select("+password");
		if (userData) {
			const isMatch = await bcrypt.compare(req.body.old_password, userData.password);
			if (isMatch) {
				const updateUser = await AdminUser.findOneAndUpdate({_id: req.body.admin_id, status: 1}, {password: req.body.password}, {new:true,runValidators:true});
				return res.send(response.success(200, 'Password Change successfully', []));
			} else {
				return res.send(response.error(400, 'Currant Password is wrong', []));
			}
		} else {
			return res.send(response.error(400, 'Data Not found', []));
		}

	} catch(error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}