const express = require("express");
const router = new express.Router();
const auth = require("../middleware/admin_auth");
const AuthController = require("../controllers/admin/AuthController");
const LanguageController = require("../controllers/admin/LanguageController");
const ProfileQuestionController = require("../controllers/admin/ProfileQuestionController");
const MatchBasicTopicController = require("../controllers/admin/MatchBasicTopicController");
const MatchBasicTopicQueController = require("../controllers/admin/MatchBasicQueAnsController");
const UsersController = require("../controllers/admin/UsersController");
const EmojiStoryController = require("../controllers/admin/EmojiStoryController");
const CreditStickersController = require("../controllers/admin/CreditStickersController");
const TopicWiseQueAns = require("../controllers/admin/TopicWiseQueAns");
const DiamondsCreditsRewardController = require("../controllers/admin/DiamondsCreditsRewardController");
const PremiumPlansController = require("../controllers/admin/PremiumPlansController");
const RedeemVoucherController = require("../controllers/admin/RedeemVoucherController");
const ReportingController = require("../controllers/admin/ReportingController");
const WebViewPageController = require("../controllers/admin/WebViewPageController");
const OfferMePostController = require("../controllers/admin/OfferMePostController");
const BuyCreditsController = require("../controllers/admin/BuyCreditsController");
const AdminSettingController = require("../controllers/admin/AdminSettingController");
const BuyCreditsDetailsController = require("../controllers/admin/BuyCreditsDetailsController");
const ReligionController = require("../controllers/admin/ReligionController");
const ColourController = require("../controllers/admin/ColourController");

router.post("/login", AuthController.login); // user login
router.post("/verify-token", AuthController.verifyToken); // user login
router.post("/update-admin-profile", AuthController.updateAdminProfile); // admin update profile 
router.post("/admin-change-password", AuthController.adminChangePassword); // admin change password

router.post("/users-list", UsersController.usersList); // /
router.post("/users-status-change", UsersController.usersStatusChange); //
router.post("/dashboard-counts", UsersController.dashboardCounts); // Dashboard Counts

router.post("/language-list", LanguageController.languageList); //
router.post("/language-store-update", LanguageController.languageStoreUpdate); //
router.post("/language-status-change", LanguageController.languageStatusChange); //

router.post("/profile-question-list", ProfileQuestionController.profileQuestionList); // List Data
router.post("/profile-question-store-update", ProfileQuestionController.profileQuestionStoreUpdate); // Store and update data
router.post("/profile-question-status-change", ProfileQuestionController.profileQuestionStatusChange); //

router.post("/basic-topic-list", MatchBasicTopicController.basicTopicList); // List
router.post("/basic-topic-store-update", MatchBasicTopicController.basicTopicStoreUpdate); // Store Data
router.post("/basic-topic-status-change", MatchBasicTopicController.basicTopicStatusChange); //
 
router.post("/credit-stickers-list", CreditStickersController.creditStickerList); // List
router.post("/credit-stickers-store-update", CreditStickersController.creditStickerStoreUpdate); // Store Data
router.post("/credit-stickers-status-change", CreditStickersController.creditStickerStatusChange); //

router.post("/story-emoji-list", EmojiStoryController.emojiStoryList); // List
router.post("/story-emoji-store-update", EmojiStoryController.emojiStoryStoreUpdate); // Store Data
router.post("/story-emoji-status-change", EmojiStoryController.emojiStoryStatusChange); //

router.post("/basic-topic-que-ans-list", TopicWiseQueAns.basicTopicQueAnsList); // List
router.post("/basic-topic-que-ans-store-update", TopicWiseQueAns.storeUpdate); //
router.post("/basic-topic-que-ans-status-change", TopicWiseQueAns.statusChange); // PremiumPlansController

router.post("/diamonds-credits-reward-list", DiamondsCreditsRewardController.recordList); // List
router.post("/diamonds-credits-reward-store-update", DiamondsCreditsRewardController.storeUpdate); //
router.post("/diamonds-credits-reward-status-change", DiamondsCreditsRewardController.statusChange); //

router.post("/premium-plans-list", PremiumPlansController.recordList); // List
router.post("/premium-plans-store-update", PremiumPlansController.storeUpdate); //
router.post("/premium-plans-status-change", PremiumPlansController.statusChange); //

router.post("/redeem-voucher-list", RedeemVoucherController.redeemVoucherList); // List
router.post("/redeem-voucher-store-update", RedeemVoucherController.redeemVoucherStoreUpdate); // Store Data
router.post("/redeem-voucher-status-change", RedeemVoucherController.redeemVoucherStatusChange); // Change status active / inactive

router.post("/reporting-list", ReportingController.reportingList); //
router.post("/reporting-store-update", ReportingController.reportingStoreUpdate); //
router.post("/reporting-status-change", ReportingController.reportingStatusChange); //

router.post("/web-view-page-list", WebViewPageController.webViewPageList); //
router.post("/web-view-page-details", WebViewPageController.webViewPageDetailList); //
router.post("/web-view-page-store-update", WebViewPageController.webViewPageStoreUpdate); //

router.post("/offer-me-posts-list", OfferMePostController.offerMePostsList); // List
router.post("/offer-me-posts-store-update", OfferMePostController.offerMePostsStoreUpdate); // Store Data
router.post("/offer-me-posts-status-change", OfferMePostController.offerMePostsStatusChange); //

router.post("/buy-credits-list", BuyCreditsController.buyCreditsList); // List
router.post("/buy-credits-store-update", BuyCreditsController.buyCreditsStoreUpdate); // Store Data
router.post("/buy-credits-status-change", BuyCreditsController.buyCreditsStatusChange); //

router.post("/admin-setting-list", AdminSettingController.adminSettingList); // Admin setting list
router.post("/admin-setting-store-update", AdminSettingController.adminSettingStoreUpdate); // Admin setting store and update

router.post("/buy-credits-details-list", BuyCreditsDetailsController.buyCreditsList); // List
router.post("/buy-credits-details-store-update", BuyCreditsDetailsController.buyCreditsStoreUpdate); // Store Data
router.post("/buy-credits-details-status-change", BuyCreditsDetailsController.buyCreditsStatusChange); //

router.post("/religion-list", ReligionController.religionList); // List
router.post("/religion-store-update", ReligionController.religionstoreUpdate); // Store Data
router.post("/religion-status-change", ReligionController.religionStatusChange); //

router.post("/colour-list", ColourController.colourList); // List
router.post("/colour-store-update", ColourController.colourStoreUpdate); // Store Data
router.post("/colour-status-change", ColourController.colourStatusChange); //

module.exports = router;

//git add .
//git commit -m "Changes in admin api"
//git push
//git pull