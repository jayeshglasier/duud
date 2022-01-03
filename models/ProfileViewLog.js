const mongoose = require("mongoose");

const ProfileViewLogSchema = new mongoose.Schema({
	user_id: { //login user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	view_profile_user_id: { //profile viewed user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
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

const ProfileViewLog = new mongoose.model("profile_view_log", ProfileViewLogSchema);
module.exports = ProfileViewLog;