const mongoose = require("mongoose");

const DiamondsCreditsRewardSchema = new mongoose.Schema({
	reward_type: {
		type: String, // "cash" / "credits"
		trim: true,
		required: true
	},
	credits_cash: {
		type: Number,
		min: [0,'invalid value'],
		required: true
	},
	diamonds: {
		type: Number,
		min: [0,'invalid value'],
		required: true
	},

	status: {
		type: Number, // 0=Inactive, 1=active
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

const DiamondsCreditsReward = new mongoose.model("diamonds_credits_reward", DiamondsCreditsRewardSchema);
module.exports = DiamondsCreditsReward;