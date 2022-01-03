const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		validate(value){
			if (!validator.isEmail(value)) {
				throw new Error("Invalid Email")
			}
		},
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'email must be a valid email']
	},
	password: {
		type: String,
		trim: true,
		select: false
	},
	name: {
		type: String,
		trim: true,
	},
	birth_date: {
		type: Date,
		validate(value){
			if (!validator.isDate(value)) {
				throw new Error("date formate is invalid")
			}
		}
	},
	gender: {
		type: Number, // 1=male, 2=female or 3=other
		min: [1,'invalid gender'],
    	max: [3,'invalid gender'],
		trim: true,
	},
	interest: {
		type: Number, // 1=male, 2=female or 3=everyone
		min: [1,'invalid gender'],
    	max: [3,'invalid gender'],
		trim: true,
	},
	about: {
		type: String,
		trim: true,
	},
	why_im_here: {
		type: String,
		trim: true,
	},
	hometown: {
		type: String,
		trim: true,
	},
	language: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'profile_language',
		required: true,
		trim: true,
	}],
	occupation: {
		type: String,
		trim: true,
	},
	height: {
		type: Number,
		min: [0,'invalid height'],
    	max: [10,'invalid height'],
		default: 5,
	},
	weight: {
		type: Number,
		min: [0,'invalid weight'],
    	max: [200,'invalid weight'],
		// default: 30,
	},
	children: {
		type: Number, //0=No, 1=Yes
		min: [0,'invalid children status'],
    	max: [1,'invalid children status'],
		trim: true,
	},
	edu_qualification: {
		type: String,
		trim: true,
	},
	relationship_status: {
		type: Number, // 1=Single, 2=Committed, 3=Complicate
		min: [1,'invalid relationship status'],
    	max: [3,'invalid relationship status'],
		trim: true,
	},
	smoking: {
		type: Number, //0=No, 1=Yes
		min: [0,'invalid smoking'],
    	max: [1,'invalid smoking'],
		trim: true,
	},
	hair_color: {
		type: String, //type: mongoose.Schema.Types.ObjectId, ref: 'profile_language',
		trim: true,
	},
	eye_color: {
		type: String, //type: mongoose.Schema.Types.ObjectId, ref: 'profile_language',
		trim: true,
	},
	nationality: {
		type: String,
		trim: true,
	},
	religion: {
		type: String,
		trim: true,
	},
	profile_image: {
		type: String,
		trim: true,
	},
	album_images: {
		type: [String]
	},
	social_id: {
		type: String,
		trim: true,
	},
	social_type: {
		type: Number, // 1=google, 2=facebook, 3=apple
		min: [1,'invalid social type'],
    	max: [3,'invalid social type'],
	},
	device_token: {
		type: String,
		trim: true,
	},
	device_type: {
		type: Number, // 1=web, 2=ios, 3=android
		min: [1,'invalid device type'],
    	max: [3,'invalid device type']
	},
	email_verified_status: {
		type: Number, //0=Pending, 1=Verified
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 0,
	},
	registration_status: {
		type: Number, //0=Pending, 1=Success
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 0,
	},
	reset_password_status: {
		type: Number, //0=Inactive, 1=active
		min: [0,'invalid status'],
    	max: [1,'invalid status'],
		default: 0,
	},
	location: {
        type: {  
			type: String,
			enum: ['Point']
		},
        coordinates: {
			type: [Number]
		}
    },
	question_answer: 
	[{
		question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile_Question' },
		answer:{ type: String, trim: true }
	}],
	credits_value: {
		type: Number, //
		min: [0,'invalid value']
	},
	diamonds_value: {
		type: Number, //
		min: [0,'invalid value']
	},
	otp: { //one use for offer me chat
		type: Number,
		min: [100000,'invalid otp'], 
		max: [999999,'invalid otp'],
		select: false
	},
	otp_created_at: {
		type: Date, 
		select: false
	},
	online_status: { //online offline status
		type: Number, //0=offline, 1=online
		min: [0,'invalid status'], max: [1,'invalid status'], default: 1, select: false
	},
	online_updated_at: { //last online date time store 
		type: Date,
		select: false
	},
	tokens: [{ //store jwt tokens array
		token: {
			type: String, trim: true
		},
		signedAt: {
			type: Date, default: Date.now
		}
	}],
	build_version: { //store app version store for login time
		type: String,
		trim: true,
		select: false
	},
	firebase_id: { //for chat module
		type: String,
		trim: true,
	},

	status: {
		type: Number, //0=Inactive, 1=active, 9=deleted
		min: [0,'invalid status'], max: [9,'invalid status'], default: 1
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

userSchema.statics.userValidate = function (userData) {
	const schema = Joi.object({
		name: Joi.string().allow('',null).trim(true), //.messages({'any.required': `name is a required field`}),
		birth_date: Joi.string().allow('',null).trim(true).label('Birth date'),
		gender: Joi.number().allow('',null),
		interest: Joi.number().allow('',null),
		about: Joi.string().allow('',null).trim(true),
		why_im_here: Joi.string().allow('',null).trim(true).label('why im here'),
		hometown: Joi.string().allow('',null).trim(true),
		language: Joi.array().items(Joi.objectId().label('language').allow('',null).messages({'string.pattern.name': `{{#label}} is invalid`})), //
		occupation: Joi.string().allow('',null).trim(true),
		height: Joi.number().allow('',null),
		weight: Joi.number().allow('',null),
		children: Joi.number().allow('',null),
		edu_qualification: Joi.string().allow('',null).trim(true).label('Education qualification'),
		relationship_status: Joi.number().allow('',null).label('Relationship status'),
		smoking: Joi.number().allow('',null),
		hair_color: Joi.string().allow('',null).trim(true).label('hair color'),
		eye_color: Joi.string().allow('',null).trim(true).label('eye color'),
		nationality: Joi.string().allow('',null).trim(true).label('nationality'),
		religion: Joi.string().allow('',null).trim(true).label('religion'),
	});
	const validation = schema.validate(userData, __joiOptions)
	return validation;
}

userSchema.index({ "location": "2dsphere" });

// generating tokens
userSchema.methods.generatingAuthToken = async function () {
	try {
		const token = jwt.sign({_id: this._id}, process.env.SECRET_KEY, {algorithm: 'HS384'} );
		return token;
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

// convert password into hash
userSchema.pre("save", async function(next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}	
	next();
});

// password hashing when updating password
userSchema.pre("findOneAndUpdate", async function(next) {
	try {
		const password = this.getUpdate().password;
		if (password) {
			const hashPassword = await bcrypt.hash(password, 10);
			this.getUpdate().password = hashPassword;
		}
		next();
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return next(error);
	}
});

const User = new mongoose.model("User", userSchema);
module.exports = User;