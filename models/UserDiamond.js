const mongoose = require("mongoose");

const UserDiamondSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	title: {
		type: String,
		trim: true,
		required: true
	},
	ref_user_id: { //for sending diamonds user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	debit_credit_status: {
		type: Number, //0=credit(-), 1=debit(+)
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		required: true
	},
	diamonds_value: {
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

const UserDiamond = new mongoose.model("User_Diamond", UserDiamondSchema);
module.exports = UserDiamond;