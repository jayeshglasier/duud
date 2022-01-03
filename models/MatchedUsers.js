const mongoose = require("mongoose");

const MatchedUsersSchema = new mongoose.Schema({
	user_id: { //login user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	matched_user_id: { //liked user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	like_unlike_status: {
		type: Number, //0=unlike, 1=liked
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
	},
	super_like_status: {
		type: Number, //0=unlike, 1=super_liked
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
	},
	report_status: {
		type: Number, //0=unreported, 1=reported
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
	},
	block_status: {
		type: Number, //0=unblocked, 1=blocked
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
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

const MatchedUsers = new mongoose.model("matched_user", MatchedUsersSchema);
module.exports = MatchedUsers;