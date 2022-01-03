const mongoose = require("mongoose");

const UserSettingNotificationSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	notification_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Setting_Notification',
		required: true
	},

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
	},
	created_at: {
		type: Date, select: false
	},
	updated_at: {
		type: Date, select: false
	}
},{
	versionKey: false,
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

const UserSettingNotification = new mongoose.model("User_Setting_Notification", UserSettingNotificationSchema);
module.exports = UserSettingNotification;