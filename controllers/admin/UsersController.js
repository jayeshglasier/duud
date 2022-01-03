const response = require("../../helper/response");
const console = require("../../helper/console");
const User = require("../../models/User");
const UserResource = require('../../controllers/resources/UserResource');
const ProfileLanguage = require("../../models/ProfileLanguage");

// Jayesh sukhadiya : 22-11-2021
exports.usersList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 5000};
		let skip = { $skip : (page - 1) * 5000};
		let project = {
			$project:{
				name:1,
				email:1,
				gender:1,
				hometown:1,
				status:1,
				created_at:1,
				interest:1,
				about:1,
				birth_date:1,
				height:1,
				credits_value:1,
				diamonds_value:1,
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['name'] = {$regex: new RegExp(req.body.search, 'i')};
			query1['email'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await User.count(query1);
		totalPage = Math.ceil(totalRecords/5000);

		let search = {"$match": {$or: [query1]}};

		let condition = '';
		if(req.body.status == 1){
			condition = {"$match": {status:1}};
		}
		else if(req.body.status == 0){
			condition = {"$match": {status:0}};
		}else{
			condition = {"$match": {status:{$in:[0,1]}}};
		}

		let condition1 = ''; // 1=male, 2=female or 3=other
		if(req.body.gender == 1){
			condition1 = {"$match": {gender:1}};
		}
		else if(req.body.gender == 2){
			condition1 = {"$match": {gender:2}};
		}
		else if(req.body.gender == 3){
			condition1 = {"$match": {gender:3}};
		}
		else{
			condition1 = {"$match": {}};
		}
		
		let sort = {
            $sort:{
                created_at:-1
            }
		};

		let UserData = await User.aggregate([search,sort,skip,limit,project,condition,condition1]);
		return res.send(response.success(200, 'success', UserData));

	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.usersStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const updateRecord = await User.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.dashboardCounts = async (req,res) => {
	try {
		let dashboardCount = {};
		dashboardCount['users'] = await User.count();
		dashboardCount['primium_users'] = 0;
		dashboardCount['language'] = await ProfileLanguage.count();
		return res.send(response.success(200, 'success', dashboardCount));

	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}