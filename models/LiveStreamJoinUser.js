const mongoose = require("mongoose");

const LiveStreamJoinUserSchema = new mongoose.Schema({
	live_channel_id: { //Live Stream Channel object id
		type: mongoose.Schema.Types.ObjectId, ref: 'Live_Stream_Channel',
		required: true
	},
	channel_id: { //unique channel id
		type: String,
		trim: true,
		required: true
	},
	user_id: { //live stream join user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		required: true
	},
	like_count: { //like send to live user
		type: Number,
		min: [0,'invalid value'],
		select: false
	},
	// sticker_id: { //sticker send
	// 	type: String,
	// 	trim: true,
	// 	required: true
	// },
	// diamond_count: {
	// 	type: Number,
	// 	min: [0,'invalid value'],
	// 	select: false
	// },

	status: {
		type: Number, // 0=Inactive, 1=active
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

const LiveStreamJoinUser = new mongoose.model("Live_Stream_Join_User", LiveStreamJoinUserSchema);
module.exports = LiveStreamJoinUser;