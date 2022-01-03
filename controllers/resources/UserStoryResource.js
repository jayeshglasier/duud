const UserStoryResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {

		resData.seen_status || resData.seen_status== 0 ? resData.seen_status= String(resData.seen_status) : resData.seen_status;
		resData.story_viewer_count || resData.story_viewer_count== 0 ? resData.story_viewer_count= String(resData.story_viewer_count) : resData.story_viewer_count;

		ResponseArray.push(
			{
				"_id": resData._id ? resData._id : "",
				"story_file": resData.story_file ? resData.story_file : "",
				"created_at": resData.created_at ? resData.created_at : "",
				"seen_status": resData.seen_status ? resData.seen_status : "0",
				"story_viewer_count": resData.story_viewer_count ? resData.story_viewer_count : "0",
			}
		);
	}
	return ResponseArray;
}

module.exports = UserStoryResource;