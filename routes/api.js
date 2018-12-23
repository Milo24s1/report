const express = require('express');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');
const EmailController = require('../src/model/email');
const ReplyIOController = require('../src/model/replyIO');

router.post('/jetbuzzUpdate',function (req,res) {
    CampaignController.updateCampaignRecordViaJetbuzz(req,res);
});

router.post('/jetbuzzReplies',function (req,res) {
    CampaignController.updateCampaignRepliesViaJetbuzz(req,res);
});

/**
 * this is route for post data from replyIOPeopleUpdateTask
 */
router.post('/replyIOReplies',function (req,res) {
    console.log('called route');
    ReplyIOController.updateCampaignRepliesViaCron(req,res);
});


module.exports = router;
