const mongoose = require("mongoose");

const OfferMeSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	purpose: {
		type: String,
		trim: true,
		required: true
	},
	comments: {
		type: String,
		trim: true,
	},
	interest: {
		type: Number, //1=male, 2=female or 3=everyone
		min: [1,'invalid interest'],
    	max: [3,'invalid interest'],
	},
	min_age: {
		type: Number,
		min: [0,'invalid age'],
    	max: [100,'invalid age'],
	},
	max_age: {
		type: Number,
		min: [0,'invalid age'],
    	max: [100,'invalid age'],
	},
	height: {
		type: Number,
		min: [0,'invalid height'],
    	max: [8,'invalid height'],
	},
	filter_by: {
		type: Number, //1=online, 2=new
		min: [1,'invalid filter-by status'],
    	max: [2,'invalid filter-by status'],
	},
	location: {
		type: String,
		trim: true,
	},
	relationship_status: {
		type: Number, //1=Single, 2=Committed, 3=Complicate
		min: [1,'invalid relationship status'],
    	max: [3,'invalid relationship status'],
	},
	weight: {
		type: Number,
		min: [0,'invalid weight'],
	},
	eye_colour: {
		type: String,
		trim: true,
	},
	hair_colour: {
		type: String,
		trim: true,
	},
	religion: {
		type: String,
		trim: true,
	},
	nationality: {
		type: String,
		trim: true,
	},
	offer_accept_status: {
		type: Number, // 0=pending, 1=accept
		min: [0,'invalid status'], max: [1,'invalid status'], default: 0
	},

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

const OfferMe = new mongoose.model("offer_me", OfferMeSchema);
module.exports = OfferMe;