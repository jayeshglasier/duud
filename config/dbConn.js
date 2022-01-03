const mongoose = require("mongoose");
const console = require("../helper/console");

mongoose.connect("mongodb+srv://kamalsherma:l2GIQc5mMOu0gtDo@cluster0.bpyxs.mongodb.net/duud_dating_app?retryWrites=true&w=majority", {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
}).then(() => {
	console.log("connection is successful");
}).catch((error) => {
	console.error(error.message, __filename, 'MongoDB Connection Failed');
	console.log("connection not found");
})