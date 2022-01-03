const OfferMeResource = (res) => {
	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {
		ResponseArray.push(
			{
				"_id": resData._id ? resData._id : "",
				"user_id": resData.user_id ? resData.user_id : "",
				"purpose": resData.purpose ? resData.purpose : "",
				"comments": resData.comments ? resData.comments : "",
				"interest": resData.interest ? String(resData.interest) : "",
				"min_age": resData.min_age ? String(resData.min_age) : "",
				"max_age": resData.max_age ? String(resData.max_age) : "",
				"height": resData.height ? String(resData.height) : "",
				"filter_by": resData.filter_by ? String(resData.filter_by) : "",
				"location": resData.location ? resData.location : "",
				"relationship_status": resData.relationship_status ? String(resData.relationship_status) : "",
				"weight": resData.weight ? String(resData.weight) : "0",
				"eye_colour": resData.eye_colour ? String(resData.eye_colour) : "",
				"hair_colour": resData.hair_colour ? String(resData.hair_colour) : "",
				"religion": resData.religion ? String(resData.religion) : "",
				"nationality": resData.nationality ? String(resData.nationality) : "",
				"offer_accept_status": resData.offer_accept_status || resData.offer_accept_status== 0 ? String(resData.offer_accept_status) : "0",
				"status": resData.status || resData.status== 0 ? String(resData.status) : "0",
				"created_at": resData.created_at,
			}
		);
	}
	return ResponseArray;
}

module.exports = OfferMeResource;