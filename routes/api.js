const express = require('express');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');
const EmailController = require('../src/model/email');

router.post('/jetbuzzUpdate',function (req,res) {
    CampaignController.updateCampaignRecordViaJetbuzz(req,res);
});


module.exports = router;
