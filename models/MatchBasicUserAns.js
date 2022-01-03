const mongoose = require("mongoose");

const MatchBasicUserAnsSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	topic_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'match_basic_topic',
		required: true
	},
    question_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'match_basic_topic_que',
		required: true
	},
	answer: {
		type: Number, // 0=none, 1=answer_one, 2=answer_two
		min: [0,'invalid answer'],
    	max: [2,'invalid answer'],
		default: 0,
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

const MatchBasicUserAns = new mongoose.model("match_basic_user_ans", MatchBasicUserAnsSchema);
module.exports = MatchBasicUserAns;
