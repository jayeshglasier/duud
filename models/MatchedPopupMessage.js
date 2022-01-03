const mongoose = require("mongoose");

const MatchedPopupMessageSchema = new mongoose.Schema({
	user_id: { //auth user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	matched_user_id: { //sending_popup_user_id
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	read_status: {
		type: Number, //0=unread, 1=read
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
	},

	status: {
		type: Number, //0=Inactive, 1=Active
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1,
		select: false
	},
	created_at: {
		type: Date,
		select: false
	},
	updated_at: {
		type: Date,
		select: false
	}
},{
	versionKey: false,
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

const MatchedPopupMessage = new mongoose.model("Matched_Popup_Message", MatchedPopupMessageSchema);
module.exports = MatchedPopupMessage;