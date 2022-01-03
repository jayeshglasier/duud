const mongoose = require("mongoose");

const RedeemVoucherSchema = new mongoose.Schema({
    title: {
		type: String,
		trim: true,
		required: true
	},
	voucher_code: {
		type: String,
		trim: true,
		required: true
	},
	credits_value: {
		type: String,
		trim: true,
		required: true
	},
	voucher_start_date: {
		type: Date,
		required: true
	},
	voucher_end_date: {
		type: Date,
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

const RedeemVoucher = new mongoose.model("Redeem_Voucher", RedeemVoucherSchema);
module.exports = RedeemVoucher;