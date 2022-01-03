const mongoose = require("mongoose");

const UserProfileReportSchema = new mongoose.Schema({
	user_id: { //login user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	reported_user_id: { //reported user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	report_id: { //report id
		type: mongoose.Schema.Types.ObjectId, ref: 'reporting',
		required: true
	},
	report_text: { //report text
		type: String,
		trim: true,
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

const UserProfileReport = new mongoose.model("User_Profile_Report", UserProfileReportSchema);
module.exports = UserProfileReport;