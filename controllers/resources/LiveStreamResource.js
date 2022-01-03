const LiveStreamResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];
	for (const resData of res) {
		ResponseArray.push(
			{
				_id: resData._id ? resData._id : "",
				channel_id: resData.channel_id ? resData.channel_id : "",
				current_stream_viewers_count: resData.current_stream_viewers_count ? resData.current_stream_viewers_count : 0,
				current_stream_likes_count: resData.current_stream_likes_count ? resData.current_stream_likes_count : 0,
				user_id: resData.user_id ? resData.user_id : "",
				favorite_status: resData.favorite_status ? resData.favorite_status : 0,
				distance: resData.distance,
				status: resData.status,
			}
		);
	}
	return ResponseArray;
}

module.exports = LiveStreamResource;