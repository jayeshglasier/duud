const mongoose = require("mongoose");

const MatchedBasicQueUserListSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	matched_user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	matched_status: {
		type: Number, // 0=Inactive, 1=active (open heart status)
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 0,
	},

	status: {
		type: Number, //0=Inactive, 1=active
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

const MatchedBasicQueUserList = new mongoose.model("Matched_Basic_Que_User_List", MatchedBasicQueUserListSchema);
module.exports = MatchedBasicQueUserList;