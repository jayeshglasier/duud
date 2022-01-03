const mongoose = require("mongoose");

const WebViewPageSchema = new mongoose.Schema({
	page_name: {
		type: String,
		trim: true,
    },
    description: {
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

const WebViewPage = new mongoose.model("web-view-page", WebViewPageSchema);
module.exports = WebViewPage;