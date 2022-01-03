const mongoose = require("mongoose");

const LiveStreamChannelSchema = new mongoose.Schema({
	channel_id: { //unique channel id
		type: String,
		trim: true,
		required: true
	},
	user_id: { //login user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		trim: true,
		required: true,
	},
	current_stream_diamonds_count: { //current live stream diamonds count
		type: Number,
		min: [0,'invalid value'],
		default: 0,
	},
	current_stream_viewers_count: { //current live stream viewers count
		type: Number,
		min: [0,'invalid value'],
		default: 0,
	},
	current_stream_likes_count: { //current live stream likes count
		type: Number,
		min: [0,'invalid value'],
		default: 0,
	},
	// join_user_ids: [{
	// 		type: mongoose.Schema.Types.ObjectId, ref: 'User',
	// 		required: true,
	// 		trim: true,
	// }],
	// send_diamond_user_ids: [{
	// 	type: mongoose.Schema.Types.ObjectId, ref: 'User',
	// 	required: true,
	// 	trim: true,
	// }],

	status: {
		type: Number, // 0=offline, 1=online(Live)
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1
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

const LiveStreamChannel = new mongoose.model("Live_Stream_Channel", LiveStreamChannelSchema);
module.exports = LiveStreamChannel;