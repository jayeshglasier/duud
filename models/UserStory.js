const mongoose = require("mongoose");

const UserStorySchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	story_file: {
		type: String,
		trim: true,
		required: true
	},

	status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
	},
	created_at: {
		type: Date, // select: false
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

const UserStory = new mongoose.model("user_story", UserStorySchema);
module.exports = UserStory;