const MatchBasicTopicResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {

		ResponseArray.push(
			{
				"_id": resData._id ? resData._id : "",
				"title": resData.title ? resData.title : "",
				"icon": resData.icon ? resData.icon : "",
				"per": resData.per ? String(resData.per) : "0",
			}
		);
	}
	return ResponseArray;
}

module.exports = MatchBasicTopicResource;