const mongoose = require("mongoose");

const UserStorySeenSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	story_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'user_story',
		required: true
	},
	seen_status: {
		type: Number, // 0=Unseen, 1=Seen
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 1
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

const UserStorySeen = new mongoose.model("user_story_seen", UserStorySeenSchema);
module.exports = UserStorySeen;