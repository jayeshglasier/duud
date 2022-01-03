const response = require("../../helper/response");
const console = require("../../helper/console");
const Colour = require("../../models/Colour");

exports.colourStoreUpdate = async (req,res) => {
	try {
		console.log('ddd');
		if (req.body.colour_name.trim() == "" || req.body.colour_name == null) {
			return res.send(response.error(400, 'Colour name must be required', []));
		}
		const exists = await Colour.exists({ type: req.body.type,colour_name: req.body.colour_name });
		if (exists) {
			return res.send(response.error(400, 'Colour name is already exists', []));
		}
		const recordSave = new Colour({
			type: req.body.type,
			colour_name: req.body.colour_name
		});

		if(req.body.colour_id){
			const update = await Colour.findByIdAndUpdate(req.body.colour_id, {type: req.body.type,colour_name: req.body.colour_name}, {new: true, runValidators: true});
		}else{
			const recordsData = await recordSave.save();
		}
		
		return res.send(response.success(200, 'Colour store successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.colourList = async (req,res) => {
	try {

		let page = 1;
		if(req.query.page != undefined){
			page = req.query.page;
		}
		let limit = { $limit : 1000};
		let skip = { $skip : (page - 1) * 1000};
		let project = {
			$project:{
				colour_name:1,
				type:1,
				status:1
			}
		}
		let query1 = {};
		if(req.body.search){
			query1['colour_name'] = {$regex: new RegExp(req.body.search, 'i')};
		}
		let totalRecords = await Colour.count(query1);
		totalPage = Math.ceil(totalRecords/1000);

		let search = {"$match": {$or: [query1]}};
		let sort = {
            $sort:{
                created_at:-1
            }
        };

		let recordsData = await Colour.aggregate([search,sort,skip,limit,project]);
		return res.send(response.success(200, 'success', recordsData));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}

exports.colourStatusChange = async (req,res) => {
	try {
		if(req.body._id){
			const language = await Colour.findByIdAndUpdate(req.body._id, {status: req.body.status}, {new: true, runValidators: true});
		}
		return res.send(response.success(200, 'Status changes successfully', []));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', [] ));
	}
}