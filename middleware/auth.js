const jwt = require("jsonwebtoken");
const User = require("../models/User");
const response = require("../helper/response");
const commonHelpers = require("../helper/commonHelpers");
const console = require("../helper/console");
const {getAge} = require('../helper/commonHelpers')

const auth = async (req, res, next) => {
	try {
		// bearer token
		const bearerHeader = req.headers['authorization'];
		if (typeof bearerHeader !== 'undefined' && bearerHeader.startsWith('Bearer ')) {
			const token = bearerHeader.substring(7, bearerHeader.length);
			const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

			let user = await User.findOneAndUpdate({_id: verifyUser._id, status: 1}, {online_status: 1, online_updated_at: new Date()}).lean();
			if (!user) {
				return res.send(response.error(401, 'User is Inactive', [] ));
			}

			//token compare and check in database
			const tokenExists = user.tokens.some(t => t.token === token);
			if(!tokenExists) return res.send(response.error(401, 'Token is expired', [] ));

			user.token = token;
			req.user = user;
			req.user.age = req.user.birth_date ? getAge(req.user.birth_date) : 0;
			req.user.profile_per = commonHelpers.userProfilePer(req.user);
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
