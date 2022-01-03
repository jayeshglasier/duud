const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const Notification = require('../models/Notification');
const User = require('../models/User');

let admin = require("firebase-admin");
let serviceAccount = require("../config/firebase-service-account-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const PushNotification = async (sender_id, receiver_id, notification_title, notification_body="") => { //sendNotification(req.user._id, receiver_id, 'hello test', 'test')
	try {
		Array.isArray(receiver_id) ? receiver_id : receiver_id=[receiver_id];
		let data = {sender_id, receiver_id, notification_title, notification_body};
		const schema = Joi.object({
			sender_id: Joi.objectId().label('sender id').required().messages({'string.pattern.name': `{{#label}} is invalid`}),
			receiver_id: Joi.array().items(Joi.objectId().label('receiver id').required().messages({'string.pattern.name': `{{#label}} is invalid`})),
			notification_title: Joi.string().trim(true).required().label('notification title'),
			notification_body: Joi.string().allow('',null).trim(true).label('notification body'),
		});
		const validation = schema.validate(data, { errors: { wrap: { label: '' } } });
		if (validation.error) return {error: validation.error.details[0].message};

		let userDeviceTokens = [];
		let notificationDataArray = [];
		const UserData = await User.find({_id: {$in: receiver_id}, status: 1});
		for (let i = 0; i < UserData.length; i++) {
			const element = UserData[i];
			if (element.device_token) {
				userDeviceTokens.push(element.device_token);

				notificationDataArray.push({
					sender_id: sender_id, 
					receiver_id: element._id, 
					notification_title: notification_title, 
					notification_body: notification_body
				});
			}
		}

		await Notification.insertMany(notificationDataArray); //store notification in database

		const registrationTokens = userDeviceTokens;
		const message = {
			notification: {
				title: notification_title,
				body: notification_body
			}
		};
		console.logs(`Attempting to send the notification to ${registrationTokens.length} devices.`);

		const { failureCount, successCount } = await admin.messaging().sendToDevice(registrationTokens, message, { priority: 'high' });
		console.logs(`Successfully sent the notification to ${successCount} devices (${failureCount} failed).`);

		return {success: true};
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]];
			return {error: errorMessage.message};
		} else {
			console.error(error, __filename, 'push notification failed');
			return {error: 'Something want wrong :('};
		}
	}
}

// async function myFunction() {
// 	try {
// 		let data = await PushNotification('611ca338d002821740c4d4fc','61bb0dd8d387340813ca4db0','hello test','test123')
// 		if (data.error) console.log(data.error)
// 	} catch (error) {
// 		console.log("123 "+error);
// 	}
// }

module.exports = {PushNotification};