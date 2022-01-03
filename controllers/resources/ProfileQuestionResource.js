
const ProfileQuestionResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {
		if (resData.question_id) {
			ResponseArray.push({
				"question_id": resData.question_id._id ? resData.question_id._id : "",
				"question": resData.question_id.question ? resData.question_id.question : "",
				"suggestions": resData.question_id.suggestions ? resData.question_id.suggestions : "",
				"answer_id": resData._id ? resData._id : "",
				"answer": resData.answer ? resData.answer : "",
			});
		} else {
			ResponseArray.push({
				"question_id": resData._id ? resData._id : "",
				"question": resData.question ? resData.question : "",
				"suggestions": resData.suggestions ? resData.suggestions : "",
				"answer_id": "",
				"answer": "",
			});
		}
		// ResponseArray.push({
		// 	// "_id": resData._id ? resData._id : "",
		// 	// "question": resData.question ? resData.question : "",
		// 	// "suggestions": resData.suggestions ? resData.suggestions : "",
		// 	// "answer": resData.answer ? resData.answer : "",
		// 	"question_id": resData.question_id ? resData.question_id : "",
		// 	"question": resData.question ? resData.question : "",
		// 	"suggestions": resData.suggestions ? resData.suggestions : "",
		// 	"answer_id": resData.answer_id ? resData.answer_id : "",
		// 	"answer": resData.answer ? resData.answer : "",
		// });
	}
	return ResponseArray;
}

module.exports = ProfileQuestionResource;