const mongoose = require("mongoose");

const AdminSettingSchema = new mongoose.Schema({
	free_credit_value: {
		type: Number,
		min: [0,'invalid value'],
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

const AdminSetting = new mongoose.model("admin_setting", AdminSettingSchema);
module.exports = AdminSetting;