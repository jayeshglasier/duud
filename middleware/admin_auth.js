const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const response = require("../helper/response");
const commonHelpers = require("../helper/commonHelpers");
const {errorLog} = require("../helper/consoleLog");
const console = require("../helper/console");
const {getAge} = require('../helper/commonHelpers')

const auth = async (req, res, next) => {
	try {
		// bearer token
		const bearerHeader = req.headers['authorization'];
		if (typeof bearerHeader !== 'undefined' && bearerHeader.startsWith('Bearer ')) {
			const token = bearerHeader.substring(7, bearerHeader.length);
			if (!token) return res.send(response.error(401, 'Token Not Found', [] ));
			
			const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
			let adminUser = await AdminUser.findOne({_id: verifyUser._id});
			adminUser = JSON.parse(JSON.stringify(adminUser));
			adminUser.token = token; // add token in user document
			req.user = adminUser;

			next();
		} else {
			return res.send(response.error(401, 'Token Not Found', [] ));
		}
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Token is invalid', [] ));
	}
}

module.exports = auth;
