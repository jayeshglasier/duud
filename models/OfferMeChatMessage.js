const mongoose = require("mongoose");

const OfferMeChatMessageSchema = new mongoose.Schema({
	offer_me_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'offer_me',
		required: true
	},
	sender_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	receiver_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	message_offer_status: {
		type: Number, //0=message, 1=offer
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		required: true
	},
	message: {
		type: String,
		trim: true,
	},
	offer_price: {
		type: Number,
		min: [0,'invalid value'],
	},
	offer_status: {
		type: Number, // 0=pending, 1=accept, 2=reject
		min: [0,'invalid status'], max: [2,'invalid status']
	},
	read_status: {
		type: Number, // 0=unread, 1=read
		min: [0,'invalid status'], max: [1,'invalid status'], default: 0, select: false
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

const OfferMeChatMessage = new mongoose.model("Offer_Me_Chat_Message", OfferMeChatMessageSchema);
module.exports = OfferMeChatMessage;