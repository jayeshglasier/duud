
function userProfilePer(userData){

	let basicDetailsCount = 0;
	let qAaDetailsCount = 0;
	let otherDetailsCount = 0;
	let basicDetails = ['email','name','birth_date','gender','profile_image','interest'];
	let otherDetails = ['about','hometown','language','occupation','height','children','edu_qualification','relationship_status','smoking'];

	basicDetails.forEach(element => {
		if (userData.hasOwnProperty(element) && userData[element] != "") basicDetailsCount++;
	});
	otherDetails.forEach(element => {
		if (userData.hasOwnProperty(element) && userData[element] != "") otherDetailsCount++;
	});

	let basicDetailsPer = basicDetailsCount * 40 / basicDetails.length;
	let qAaDetailsPer = userData.question_answer != null ? userData.question_answer.length * 30 / 5 : 0;
	let otherDetailsPer = otherDetailsCount * 30 / otherDetails.length;

	if (basicDetailsPer < 0) basicDetailsPer = 0;
	if (basicDetailsPer > 40) basicDetailsPer = 40;
	if (qAaDetailsPer < 0) qAaDetailsPer = 0;
	if (qAaDetailsPer > 30) qAaDetailsPer = 30;
	if (otherDetailsPer < 0) otherDetailsPer = 0;
	if (otherDetailsPer > 30) otherDetailsPer = 30;

	let profile_per = parseInt(basicDetailsPer) + parseInt(qAaDetailsPer) + parseInt(otherDetailsPer);

	return profile_per;
}

// age calculate function
const getAge = (birthDate) => {
	const age = Math.floor((new Date() - new Date(birthDate).getTime()) / 31557600000);
	return isNaN(age) ? 0 : age;
}

// age calculate function
const getDistance = (lat1, lon1, lat2, lon2) => { //getDistance(51.5103, 7.49347, 51.5200, 7.49347)
	var p = 0.017453292519943295; // Math.PI / 180
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 + 
			c(lat1 * p) * c(lat2 * p) * 
			(1 - c((lon2 - lon1) * p))/2;
  
	return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

module.exports = {
    userProfilePer,
	getAge,
	getDistance
};