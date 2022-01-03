const MatchBasicQueAnsResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {
		ResponseArray.push({
			"_id": resData._id ? resData._id : "",
			"title": resData.title ? resData.title : "",
			"months": resData.months ? String(resData.months) : "0",
			"save_percentage": resData.save_percentage ? String(resData.save_percentage) : "0",
			"price_per_month": resData.price_per_month ? String(resData.price_per_month) : "0",
			"total_price": resData.total_price ? String(resData.total_price) : "0",
			"status": resData.status ? String(resData.status) : "0",
			"expired_date": resData.expired_date ? resData.expired_date : "",
		});
	}
	return ResponseArray;
}

module.exports = MatchBasicQueAnsResource;