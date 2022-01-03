const express = require("express");
const router = new express.Router();
const AuthController = require("../controllers/AuthController");
const DiamondRewardsController = require("../controllers/DiamondRewardsController");
const WebViewPage = require("../models/WebViewPage");

router.get("/verify-email/:key/:id", AuthController.verifyEmailCallback); // email verification callback
router.get("/verified-email-success/", AuthController.verifiedEmailSuccess); // success message

router.get("/page-404", AuthController.error404); //error page

router.get("/reset-password/:key/:id", AuthController.resetPasswordWeb); // Reset Password
router.post("/reset-password/:key/:id", AuthController.resetPassword); // Reset Password

router.get("/reset-password-success/", AuthController.resetPasswordSuccess); // success message

//Web View
router.get('/privacy-policy', async function (req, res) {
	const data = await WebViewPage.findOne({_id: "61b09acd137a5135b1a27c1a"});
	res.render('web_view/privacy-policy', {data: data})
});
router.get('/terms-and-conditions', async function (req, res) {
	const data = await WebViewPage.findOne({_id: "61b09aed137a5135b1a27c1e"});
	res.render('web_view/terms-and-conditions', {data: data})
});
router.get('/help-center', async function (req, res) {
	const data = await WebViewPage.findOne({_id: "61b09a96137a5135b1a27c12"});
	res.render('web_view/help-center', {data: data})
});
router.get('/about-us', async function (req, res) {
	const data = await WebViewPage.findOne({_id: "61b09aa1137a5135b1a27c16"});
	res.render('web_view/about-us', {data: data})
});
// router.get('/faq', async function (req, res) {
// 	const data = await WebViewPage.findOne({_id: "61b09acd137a5135b1a27c1a"});
// 	res.render('web_view/faq')
// });

//rewards web view
// router.get('/diamond-rewards-index', function (req, res) { res.render('web_view/diamond-rewards-index') }); //diamond rewards index
// router.get('/diamond-to-credit-rewards', function (req, res) { res.render('web_view/diamond-to-credit-rewards') }); //diamond convert to credit rewards
// router.get('/diamond-to-cash-rewards', function (req, res) { res.render('web_view/diamond-to-cash-rewards') }); //diamond convert to cash rewards
// router.get('/cash-rewards-history', function (req, res) { res.render('web_view/cash-rewards-history') }); //cash rewards history

router.get('/diamond-rewards-index', DiamondRewardsController.diamondRewardsIndex ); //diamond rewards index
router.get('/diamond-to-credit-rewards', DiamondRewardsController.diamondToCreditRewards ); //diamond convert to credit rewards
router.get('/diamond-to-cash-rewards', DiamondRewardsController.diamondToCashRewards ); //diamond convert to cash rewards
router.get('/cash-rewards-history', DiamondRewardsController.cashRewardsHistory ); //cash rewards history

// router.get('/diamond-rewards-index/{id}', DiamondRewardsController.diamondRewardsIndex ); //diamond rewards index
// router.get('/diamond-to-credit-rewards/{id}', DiamondRewardsController.diamondToCreditRewards ); //diamond convert to credit rewards
// router.get('/diamond-to-cash-rewards/{id}', DiamondRewardsController.diamondToCashRewards ); //diamond convert to cash rewards
// router.get('/cash-rewards-history/{id}', DiamondRewardsController.cashRewardsHistory ); //cash rewards history

module.exports = router;