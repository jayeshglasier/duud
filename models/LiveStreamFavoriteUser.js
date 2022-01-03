const mongoose = require("mongoose");

const LiveStreamFavoriteUserSchema = new mongoose.Schema({
	user_id: { //login user id
		type: mongoose.Schema.Types.ObjectId, ref: 'User',
		trim: true,
		required: true
	},
	channel_id: { //favorite channel id
		type: String,
		trim: true,
		required: true
	},

	status: {
		type: Number, // 0=Inactive, 1=active
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

const LiveStreamFavoriteUser = new mongoose.model("Live_Stream_Favorite_User", LiveStreamFavoriteUserSchema);
module.exports = LiveStreamFavoriteUser;