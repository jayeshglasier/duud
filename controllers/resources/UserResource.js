const {getAge} = require('../../helper/commonHelpers');

const UserResource = (res) => {
	if (!res) return res;

	Array.isArray(res) ? res : res=[res];
	let ResponseArray = [];

	for (const resData of res) {
		let age = 0;
		if (resData.birth_date) {
			age = getAge(resData.birth_date);
		}
		resData.super_like_status || resData.super_like_status== 0 ? resData.super_like_status= String(resData.super_like_status) : resData.super_like_status;
		resData.total_match_ans_per || resData.total_match_ans_per== 0 ? resData.total_match_ans_per= String(resData.total_match_ans_per) : resData.total_match_ans_per;
		resData.matched_status || resData.matched_status== 0 ? resData.matched_status= String(resData.matched_status) : resData.matched_status;

		ResponseArray.push(
			{
				"_id": resData._id ? resData._id : "",
				"email": resData.email ? resData.email : "",
				"name": resData.name ? resData.name : "",
				"birth_date": resData.birth_date ? resData.birth_date : "",
				"gender": resData.gender ? String(resData.gender) : "",
				"interest": resData.interest ? String(resData.interest) : "",
				"about": resData.about ? resData.about : "",
				// "city": resData.city ? resData.city : "",
				"why_im_here": resData.why_im_here ? resData.why_im_here : "",
				"hometown": resData.hometown ? resData.hometown : "",
				"language": resData.language ? Array.isArray(resData.language) ? resData.language : [resData.language] : [],
				"occupation": resData.occupation ? resData.occupation : "",
				"height": resData.height ? parseFloat(resData.height).toFixed(2) : "",
				"children": resData.children ? String(resData.children) : "0",
				"edu_qualification": resData.edu_qualification ? resData.edu_qualification : "",
				"relationship_status": resData.relationship_status ? String(resData.relationship_status) : "1",
				"smoking": resData.smoking ? String(resData.smoking) : "0",
				"profile_image": resData.profile_image ? resData.profile_image : "",
				"album_images": resData.album_images ? resData.album_images : [],
				"registration_status": resData.registration_status ? String(resData.registration_status) : "0",
				// "location": JSON.stringify(resData.location) != '{}' ? resData.location : null,
				"location": resData.location ? resData.location : null,
				"question_answer": resData.question_answer ? resData.question_answer : [],
				"age": age ? String(age) : "",
				"distance": resData.distance ? String(resData.distance) : "",
				"token": resData.token,
				"profile_per": resData.profile_per ? String(resData.profile_per) : "",
				"super_like_status": resData.super_like_status,
				"match_count": resData.matchCount ? String(resData.matchCount) : "", //for temporary
				"total_match_ans_per": resData.total_match_ans_per, //for user match question answer percentage
				"matched_status": resData.matched_status, //for matched que ans user list in active heart status
				"matched_que_ans": resData.matched_que_ans, //for matched que ans user details in matched question answer list
			}
		);
	}
	return ResponseArray;
}

module.exports = UserResource;