const mongoose = require("mongoose");

const HairEyeColourSchema = new mongoose.Schema({
    type: {
		type: Number, //1=Eye, 2=Hair
		min: [1,'invalid type'], max: [2,'invalid type'],
		required: true
	},
	colour_name: {
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

const HairEyeColour = new mongoose.model("hair-eye-colour", HairEyeColourSchema);
module.exports = HairEyeColour;