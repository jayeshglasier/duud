const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const {PushNotification} = require('../helper/PushNotification');
const UserSettingNotification = require('../models/UserSettingNotification');

exports.sendNotification = async (req,res) => {
	try {
		const schema = Joi.object({
			receiver_id: Joi.objectId().label('receiver id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			notification_title: Joi.string().trim(true),
			notification_body: Joi.string().allow('',null).trim(true),
		});
		const validation = schema.validate(req.body, __joiOptions);
		if (validation.error) return res.send(response.error(400, validation.error.details[0].message, [] ));

		// const UserSettingNotificationData = await UserSettingNotification.findOne({user_id: req.body.receiver_id, notification_id: '61a8b4ce48ad09388cb51d4b', status: 0});
		// if (!UserSettingNotificationData) {
		// 	let data = await PushNotification(req.user._id, req.body.receiver_id, req.body.notification_title, req.body.notification_body);
		// 	if (data.error) return res.send(response.success(400, data.error, []));
		// }
		
		let data = await PushNotification(req.user._id, req.body.receiver_id, req.body.notification_title, req.body.notification_body);
		if (data.error) return res.send(response.success(400, data.error, []));
		
		return res.send(response.success(200, 'Successfully sent the notification', ));
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}