const mongoose = require("mongoose");

const MatchBasicTopicQueSchema = new mongoose.Schema({
    topic_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'match_basic_topic',
		required: true
	},
	question: {
		type: String,
		trim: true,
		required: true
	},
	answer_one: {
		type: String,
		trim: true,
		required: true
    },
    answer_two: {
		type: String,
		trim: true,
		required: true
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

const MatchBasicTopicQue = new mongoose.model("match_basic_topic_que", MatchBasicTopicQueSchema);
module.exports = MatchBasicTopicQue;