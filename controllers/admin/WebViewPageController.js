const response = require("../../helper/response");
const console = require("../../helper/console");
const WebViewPage = require("../../models/WebViewPage");

exports.webViewPageStoreUpdate = async (req,res) => {
	try {
		
		const recordSave = new WebViewPage({
			page_name: req.body.page_name
		});

		if(req.body._id){
			const update = await WebViewPage.findByIdAndUpdate(req.body._id, {description: req.body.description}, {new: true, runValidators: true});
		}else{

            if (req.body.page_name.trim() == "" || req.body.page_name == null) {
                return res.send(response.error(400, 'Page name must be required', []));
            }
            const exists = await WebViewPage.exists({ page_name: req.body.page_name });
            if (exists) {
                return res.send(response.error(400, 'Page name is already exists', []));
            }
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Web view page store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.webViewPageList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
                page_name:1,
                description:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['page_name'] = {$regex: new RegExp(req.body.search, 'i')};
        }

		let totalRecords = await WebViewPage.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await WebViewPage.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.webViewPageDetailList = async (req,res) => {
	try {

		let project = {
			$project:{
                page_name:1,
                description:1,
				status:1
			}
		}
        
        let aggregateQuery = {
            $match: {
                _id: require('mongoose').Types.ObjectId(req.body.web_view_id)
            }
        };

		let recordsData = await WebViewPage.aggregate([project,aggregateQuery]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}