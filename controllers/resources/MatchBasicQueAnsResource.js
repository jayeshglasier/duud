const MatchBasicQueAnsResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {

		ResponseArray.push(
			{
				"_id": resData._id ? resData._id : "",
				"topic_id": resData.topic_id ? resData.topic_id : "",
				"question": resData.question ? resData.question : "",
				"answer_one": resData.answer_one ? resData.answer_one : "",
				"answer_two": resData.answer_two ? resData.answer_two : "",
				"answer": resData.answer ? String(resData.answer) : "0",
			}
		);
	}
	return ResponseArray;
}

module.exports = MatchBasicQueAnsResource;