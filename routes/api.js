const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const UserController = require("../controllers/UserController.js");
const AuthController = require("../controllers/AuthController");
const MatchUserController = require("../controllers/MatchUserController");
const ProfileQueAnsController = require("../controllers/ProfileQueAnsController");
const UserFriendController = require("../controllers/UserFriendController");
const UserStoryController = require("../controllers/UserStoryController");
const OfferMeController = require("../controllers/OfferMeController");
const MatchQueAnsController = require('../controllers/MatchBasicQueAnsController');
const NewsController = require('../controllers/NewsController');
const NotificationController = require('../controllers/NotificationController');
const SettingController = require('../controllers/SettingController');
const StoryEmojiController = require("../controllers/StoryEmojiController");
const CreditDiamondController = require("../controllers/CreditDiamondController");
const LiveStickersController = require("../controllers/LiveStickersController");
const OfferMeChatMessageController = require("../controllers/OfferMeChatMessageController");
const LiveStreamController = require("../controllers/LiveStreamController");
const RedeemVoucherController= require("../controllers/RedeemVoucherController");
const PremiumPlansController= require("../controllers/PremiumPlansController");

//authentication module
router.post("/register", AuthController.register); //user registration
router.get("/verify-email/:key/:id", AuthController.verifyEmailCallback); // email verification callback
router.post("/login", AuthController.login); //user login
router.post("/social-login-callback", AuthController.socialLoginCallback); //social-login
router.post("/forgot-password", AuthController.forgotPassword); //Forget Password to send mail
router.post("/change-password", auth, UserController.changePassword); //change password
router.post("/logout", auth, AuthController.logout); //logout remove token
router.delete("/delete-profile", auth, UserController.deleteUser); //delete user by id

//profile module
router.get("/profile-details", auth, UserController.userProfile); //get user details
router.get("/get-profile-language", auth, UserController.getProfileLanguage); //get user details
router.post("/profile-update", auth, UserController.updateUser); //update user by id
router.post("/profile-image-upload", auth, UserController.profileImageUpload); //profile image upload
router.post("/album-images-upload", auth, UserController.albumImageUpload); //album multiple images upload
router.post("/album-image-delete", auth, UserController.albumImageDelete); //album image delete
router.post("/language-list", auth, UserController.languageList); //profile language list

//nearby user module
router.post("/update-location", auth, UserController.updateLocation); //update user location
router.post("/find-location", auth, UserController.findLocation); //user location find and filter near by user list

//profile question answer module
router.post("/profile-question-store", auth, ProfileQueAnsController.profileQuestionStore); //question store
router.get("/profile-question-list", auth, ProfileQueAnsController.profileQuestionList); //question list
router.post("/profile-question-update", auth, ProfileQueAnsController.profileQuestionUpdate); //question update
//profile answer store,update
router.post("/profile-answer-store", auth, ProfileQueAnsController.profileAnswerStore); //store user answer in user profile
router.post("/profile-answer-update", auth, ProfileQueAnsController.profileAnswerUpdate); //update user answer in user profile
router.post("/profile-answer-delete", auth, ProfileQueAnsController.profileAnswerDelete); //delete user answer in user profile

//match user module
router.post("/matching-user-list", auth, MatchUserController.matchingUserList); //matching user list
router.post("/filtered-matching-user-list", auth, MatchUserController.filteredMatchingUserList); //matching user list
router.post("/matched-user-status", auth, MatchUserController.matchedUserStatus); //matched user status
router.post("/matched-user-list", auth, MatchUserController.matchedUserList); //matched user list || given likes page

//user Friends Module
router.post("/send-friend-request", auth, UserFriendController.sendFriendRequest); //send friend request
router.post("/cancel-send-friend-request", auth, UserFriendController.cancelSendFriendRequest); //cancel send friend request
router.post("/send-friend-request-user-list", auth, UserFriendController.sendFriendRequestUserList); //send friend request users list
router.post("/receive-friend-request-user-list", auth, UserFriendController.receiveFriendRequestUserList); //receive friend request users list
router.post("/receive-friend-request-status-change", auth, UserFriendController.receiveFriendRequestStatusChange); //receive friend request users list
router.post("/friend-user-list", auth, UserFriendController.friendUserList); //all friend user list

//user story
router.post("/create-user-story", auth, UserStoryController.createUserStory); //create user story
router.post("/delete-user-story", auth, UserStoryController.deleteUserStory); //delete user story
router.post("/user-story-list", auth, UserStoryController.userStoryList); //user all story list
router.post("/user-story-viewer-list", auth, UserStoryController.userStoryViewerList); //user story viewer list
router.post("/friends-story-list", auth, UserStoryController.friendsStoryList); //friend user list
router.post("/friends-story-seen-status", auth, UserStoryController.friendsStorySeenStatus); //friend story seen status

//match question answer
router.post("/match-question-topic-list", auth, MatchQueAnsController.matchQuestionTopicList); //match question topic list
router.post("/match-topic-que-ans-list", auth, MatchQueAnsController.matchTopicQueAnsList); //match topic wise question and user answer list
router.post("/match-topic-que-ans-store", auth, MatchQueAnsController.matchTopicQueAnsStore); //match topic wise question answer store
router.post("/matching-que-ans-user-list", auth, MatchQueAnsController.matchingQueAnsUserList); //with open heart status and match percentage count
router.post("/matched-que-ans-user-status", auth, MatchQueAnsController.matchedUserStatus); //for open heart(active)
router.post("/matched-que-ans-user-details", auth, MatchQueAnsController.matchedUserDetails); //with match question answer list and user details

//news module
router.post("/my-profile-likes-user-list", auth, NewsController.myProfileLikesUserList); //for (news module) my profile liked users list
router.post("/my-profile-view-user-list", auth, NewsController.myProfileViewUserList); //for (news module) my profile visited users list

//view other user profile
router.post("/view-user-profile-details", auth, UserController.viewUserProfileDetails); //get single user details with view profile history
router.post("/view-multiple-user-details", auth, UserController.viewMultipleUserDetails); //get multiple user details
router.post("/user-status-update", auth, UserController.userStatusUpdate); //user status update
router.post("/profile-report-list", auth, UserController.profileReportList); //profile report list
router.post("/profile-report-store", auth, UserController.profileReportStore); //profile report store

//story emoji
router.post("/story-emoji-store", auth, StoryEmojiController.storeEmoji); //emoji store
router.post("/story-emoji-list", auth, StoryEmojiController.emojiList); //emoji list

//after matched popup
router.post("/matched-popup-show", auth, MatchUserController.matchedPopupShow); //matched popup
router.post("/matched-popup-status-update", auth, MatchUserController.matchedPopupStatusUpdate); //matched popup status read

//buy-credits-plans
router.post("/buy-credit-plan-list", auth, CreditDiamondController.buyCreditPlanList);

//user credits module
router.post("/add-user-credits", auth, CreditDiamondController.addUserCredits); //add user credits
router.post("/user-credits-history", auth, CreditDiamondController.userCreditsHistory); //user credits history
router.post("/user-credits-balance", auth, CreditDiamondController.userCreditsBalance); //user credits balance
router.post("/add-free-credits-store", auth, CreditDiamondController.addFreeCreditStore); //watch videos to earn credits
router.post("/add-user-diamonds", auth, CreditDiamondController.addUserDiamonds); //add user diamonds
router.post("/user-diamonds-history", auth, CreditDiamondController.userDiamondsHistory); //user diamonds history
router.post("/user-diamonds-balance", auth, CreditDiamondController.userDiamondsBalance); //user diamonds balance

//offer me module
router.post("/create-offer", auth, OfferMeController.createOffer); //create offer
router.post("/update-offer", auth, OfferMeController.updateOffer); //update offer
router.post("/delete-offer", auth, OfferMeController.deleteOffer); //delete offer
router.post("/my-offer-list", auth, OfferMeController.myOfferList); //my offer list
router.post("/offer-me-list", auth, OfferMeController.OfferMeList); //offer me list
router.post("/offer-me-user-details", auth, OfferMeController.offerMeUserDetails); //offer-me user details

//offer me chat module
router.post("/offer-me-chat-users-list", auth, OfferMeChatMessageController.offerMeChatUsersList); //
router.post("/send-offer-me-message", auth, OfferMeChatMessageController.sendOfferMeMessage); //
router.post("/get-offer-me-message-list", auth, OfferMeChatMessageController.getOfferMeMessageList); //
router.post("/send-offer-me-offer", auth, OfferMeChatMessageController.sendOfferMeOffer); //
router.post("/offer-me-offer-accept-reject", auth, OfferMeChatMessageController.offerMeOfferAcceptReject); //
router.post("/offer-me-otp-show", auth, OfferMeChatMessageController.offerMeOtpShow); //
router.post("/offer-me-otp-verify", auth, OfferMeChatMessageController.offerMeOtpVerify); //

//transfer credit
router.post("/transfer-credit-to-user", auth, CreditDiamondController.transferCreditToUser); //transfer credit to user and send mail for OTP verification
router.post("/transfer-credit-verify-otp", auth, CreditDiamondController.transferCreditVerifyOtp); //verify OTP and success

//send notification
router.post("/send-notification", auth, NotificationController.sendNotification); //for sending push notification with firebase

//setting module
router.post("/blocked-user-list", auth, SettingController.blockedUserList); //blocked-user-list
router.post("/unblocked-user-status", auth, SettingController.unblockedUserStatus); //blocked-user-list
router.post("/change-email-or-password", auth, SettingController.changeEmailOrPassword); //change email or password
router.post("/update-social-id", auth, SettingController.updateSocialId); //update Social login Id in user profile

//notification setting
router.post("/store-notification-setting", auth, SettingController.storeNotificationSetting); //
router.post("/get-notification-setting-list", auth, SettingController.getNotificationSettingList); //
router.post("/update-notification-setting-status", auth, SettingController.updateNotificationSettingStatus); //
router.post("/store-privacy-setting", auth, SettingController.storePrivacySetting); //
router.post("/get-privacy-setting-list", auth, SettingController.getPrivacySettingList); //
router.post("/update-privacy-setting-status", auth, SettingController.updatePrivacySettingStatus); //

//redeem-voucher
router.post("/redeem-voucher", auth, RedeemVoucherController.storeRedeemVoucher); //redeem voucher

//premium-plans
router.post("/premium-plans-list", auth, PremiumPlansController.premiumPlansList);
router.post("/buy-user-premium-plan", auth, PremiumPlansController.buyUserPremiumPlan);

//Live Stream
router.post("/live-stickers", auth, LiveStickersController.liveStickers); //live stickers
router.post("/store-live-stream-user", auth, LiveStreamController.storeLiveStreamUser); //user start live stream
router.post("/update-live-stream-user", auth, LiveStreamController.updateLiveStreamUser); //user rejoin live stream update status to live
router.post("/remove-live-steam-user-status", auth, LiveStreamController.removeLiveSteamUserStatus); //user stop live stream status change
router.post("/store-join-live-stream-user", auth, LiveStreamController.storeJoinLiveStreamUser); //user join live stream
router.post("/get-join-live-stream-user-list", auth, LiveStreamController.getJoinLiveStreamUserList); //get all user joined live stream
router.post("/remove-join-live-stream-user", auth, LiveStreamController.removeJoinLiveStreamUser); //joined user stop watching live stream
router.post("/send-live-stream-like", auth, LiveStreamController.sendLiveStreamLike); //joined user send likes in live stream
router.post("/send-live-stream-sticker", auth, LiveStreamController.sendLiveStreamSticker); //joined user send stickers in live stream (stickers value convert into diamonds)
router.post("/change-live-stream-favorite-status", auth, LiveStreamController.changeLiveStreamFavoriteStatus); //for favorite and unfavorite user live stream channel

router.post("/get-live-stream-user-list", auth, LiveStreamController.getLiveStreamUserList); //get all live user list
router.post("/get-single-live-stream-user-data", auth, LiveStreamController.getSingleLiveStreamUserData); //get all live user list
router.get("/favorite-live-stream-user-list", auth, LiveStreamController.favoriteLiveStreamUserList); //for user favorite live stream channel
router.post("/trending-live-stream-channel-list", auth, LiveStreamController.trendingLiveStreamChannelList); //
router.post("/nearby-user-live-stream-channel-list", auth, LiveStreamController.nearbyUserLiveStreamChannelList); //
router.post("/new-user-live-stream-channel-list", auth, LiveStreamController.newUserLiveStreamChannelList); //
router.get("/today-top-diamond-user-live-stream-channel-list", auth, LiveStreamController.todayTopDiamondUserLiveStreamChannelList); //
router.get("/weekly-top-diamond-user-live-stream-channel-list", auth, LiveStreamController.weekTopDiamondUserLiveStreamChannelList); //
router.get("/total-top-diamond-user-live-stream-channel-list", auth, LiveStreamController.totalTopDiamondUserLiveStreamChannelList); //
router.get("/live-now-top-diamond-user-live-stream-channel-list", auth, LiveStreamController.liveNowTopDiamondUserLiveStreamChannelList); //

module.exports = router;