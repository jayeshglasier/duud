const mongoose = require("mongoose");

const UserRedeemVoucherSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	voucher_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Redeem_Voucher',
		required: true
	},

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
	},
	created_at: { //redeem date
		type: Date
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

const UserRedeemVoucher = new mongoose.model("User_Redeem_Voucher", UserRedeemVoucherSchema);
module.exports = UserRedeemVoucher;