const mongoose = require("mongoose");

const ProfileLanguageSchema = new mongoose.Schema({
	language_name: {
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

const ProfileLanguage = new mongoose.model("profile_language", ProfileLanguageSchema);
module.exports = ProfileLanguage;