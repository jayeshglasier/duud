const mongoose = require("mongoose");

const UserFriendSchema = new mongoose.Schema({
	user_id: { //sender user id
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	friend_user_id: { //receiver user id
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	friend_request_status: {
		type: Number, // 0=pending, 1=Accept, 2=reject
		min: [0,'invalid status'],
    	max: [2,'invalid status'],
		default: 0
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

const UserFriend = new mongoose.model("user_friend", UserFriendSchema);
module.exports = UserFriend;