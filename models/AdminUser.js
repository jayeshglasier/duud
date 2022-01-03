const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const console = require("../helper/console");

const AdminUserSchema = new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		validate(value){
			if (!validator.isEmail(value)) {
				throw new Error("Invalid Email")
			}
		}
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

// generating tokens
AdminUserSchema.methods.generatingAdminAuthToken = async function () {
	try {
		const token = jwt.sign({_id: this._id}, process.env.SECRET_KEY, {algorithm: 'HS384'} );
		return token;
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

// password hashing when updating password
AdminUserSchema.pre("findOneAndUpdate", async function(next) {
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

// convert password into hash
AdminUserSchema.pre("save", async function(next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 10);
	}	
	next();
});

const AdminUser = new mongoose.model("admin_users", AdminUserSchema);
module.exports = AdminUser;