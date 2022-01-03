const mongoose = require("mongoose");

const ProfileAnswerSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},
	question_id: {
		type: mongoose.Schema.Types.ObjectId, ref: 'Profile_Question'
	},
	answer: {
		type: String,
		trim: true,
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

const ProfileAnswer = new mongoose.model("profile_answer", ProfileAnswerSchema);
module.exports = ProfileAnswer;