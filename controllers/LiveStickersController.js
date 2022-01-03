const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const LiveSticker = require('../models/LiveSticker');

exports.liveStickers = async (req,res) => {
	try {
		let LiveStickerData = await LiveSticker.find({status: 1}).sort({created_at: -1});

		return res.send(response.success(200, 'Success', LiveStickerData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}