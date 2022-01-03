const mongoose = require("mongoose");

const PremiumPlansSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: true
    },
    months: {
		type: Number,
		min: [0,'invalid value'],
		required: true
    },
    discount: {
		type: String,
		trim: true,
	},
	price_per_month: {
		type: String,
		trim: true,
		required: true
	},
    total_price: {
		type: String,
		trim: true,
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

const PremiumPlans = new mongoose.model("premium_plans", PremiumPlansSchema);
module.exports = PremiumPlans;