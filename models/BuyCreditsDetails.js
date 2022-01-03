const mongoose = require("mongoose");

const BuyCreditsDetailsSchema = new mongoose.Schema({
	buy_credit_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'buy_credits',
		trim: true,
		required: true
	},
	credit_value: {
		type: Number,
		min: [0,'invalid value'],
		required: true
    },
    extra_credit_detail: {
		type: String,
		trim: true,
    },
    save_percentage: {
		type: String,
		trim: true,
    },
    credit_price: {
		type: String,
		trim: true,
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

const BuyCreditsDetails = new mongoose.model("buy_credits_details", BuyCreditsDetailsSchema);
module.exports = BuyCreditsDetails;