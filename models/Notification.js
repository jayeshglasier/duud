const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
	sender_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	receiver_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	notification_title: {
		type: String,
		trim: true,
		required: true
	},
	notification_body: {
		type: String,
		trim: true,
	},

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
		select: false
	},
	created_at: {
		type: Date,
		select: false
	},
	updated_at: {
		type: Date,
		select: false
	}
},{
	versionKey: false,
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

const Notification = new mongoose.model("notification", NotificationSchema);
module.exports = Notification;