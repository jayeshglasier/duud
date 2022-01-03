const mongoose = require("mongoose");

const UserPremiumPlanSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	premium_plan_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'premium_plans',
		required: true
	},
	start_date: {
		type: Date,
		required: true
	},
	end_date: {
		type: Date,
		required: true
	},

	status: {
		type: Number, // 0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1,
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

const UserPremiumPlan = new mongoose.model("User_Premium_Plan", UserPremiumPlanSchema);
module.exports = UserPremiumPlan;