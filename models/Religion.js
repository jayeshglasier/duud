const mongoose = require("mongoose");

const ReligionSchema = new mongoose.Schema({
	religion_name: {
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

const Religion = new mongoose.model("religion", ReligionSchema);
module.exports = Religion;