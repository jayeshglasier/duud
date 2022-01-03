const mongoose = require("mongoose");

const CreditStickerSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: true
	},
	sticker_file: {
		type: String,
		trim: true,
		required: true
	},
	credits_value: {
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

const CreditSticker = new mongoose.model("Credit_Sticker", CreditStickerSchema);
module.exports = CreditSticker;