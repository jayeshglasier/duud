const response = require("../helper/response");
const console = require("../helper/console");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi);
const path = require('path');
const StoryEmoji = require('../models/StoryEmoji');

exports.storeEmoji = async (req,res) => {
	try {
		if (req.files && req.files.emoji_file) {
			let emoji_file = req.files.emoji_file;
			let uploadPath = __basedir + '/public/uploads/emoji_files/';

			const allowedMimetype = ['image/png'];
			if(!allowedMimetype.includes(emoji_file.mimetype)){
				return res.send(response.error(422, 'File format should be PNG', []));
			}
			if (emoji_file.size >= (1024 * 1024 * 1)) { // if getter then 1MB
				return res.send(response.error(400, 'Emoji file must be less then 1MB', []));
			}
			let fileName = 'emoji-file-' + Date.now() + path.extname(emoji_file.name);

			emoji_file.mv(uploadPath + fileName, function(err) {
				if(err){
					return res.send(response.error(400, 'Emoji uploading failed', []));
				}
			});
			fileName = '/public/uploads/emoji_files/' + fileName;

			const StoryEmojiData = new StoryEmoji({
				emoji_file: fileName
			});
			await StoryEmojiData.save();

			const responseData = {
				_id: StoryEmojiData._id,
				emoji_file: StoryEmojiData.emoji_file,
				created_at: StoryEmojiData.created_at
			};

			return res.send(response.success(200, 'Emoji uploaded successfully', responseData ));
		} else {
			return res.send(response.error(400, 'Please select Emoji File', [] ));
		}
	} catch (error) {
		if (error.name == "ValidationError") {
			const errorMessage = error.errors[Object.keys(error.errors)[0]]
			return res.send(response.error(406, errorMessage.message, [] ));
		} else {
			console.error(error, __filename, req.originalUrl);
			return res.send(response.error(500, 'Something want wrong :(', []));
		}
	}
}

exports.emojiList = async (req,res) => {
	try {
		const StoryEmojiData = await StoryEmoji.find({status: 1});

		return res.send(response.success(200, 'Success', StoryEmojiData ));
	} catch (error) {
		console.error(error, __filename, req.originalUrl);
		return res.send(response.error(500, 'Something want wrong :(', []));
	}
}