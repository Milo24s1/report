const express = require('express');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');
const EmailController = require('../src/model/email');
const EmailQueueController = require('../src/model/emailQueueController');
const ReplyIOController = require('../src/model/replyIO');
const AngleController = require('../src/model/angle');
const ScraperController = require('../src/model/scraper');
const ScraperEmailController = require('../src/model/scraperEmail');
const mainConfig = require('../config/mainConfig');


router.post('/getJetbuzzCompanyList',(req,res)=>{
    CompanyController.getJetbuzzCompanyList(req,res);
});

router.post('/sendJetbuzzEmail',(req,res)=>{
    EmailController.sendJetbuzzEmail(req,res);
});


router.post('/jetbuzzUpdate',function (req,res) {
    CampaignController.updateCampaignRecordViaJetbuzz(req,res);
});

router.post('/jetbuzzReplies',function (req,res) {
    CampaignController.updateCampaignRepliesViaJetbuzz(req,res);
});

/**
 * this is route for get fetch existing replyIO campaign records
 */
router.get('/replyIOCampaigns',function (req,res) {
    ReplyIOController.getReplyIOCampaignsForAPI(req,res);
});

router.post('/updateReplyIOCampaign',function (req,res) {
    ReplyIOController.updateReplyIOCampaignsForAPI(req,res);
});

router.post('/addReplyIOCampaign',function (req,res) {
    ReplyIOController.addReplyIOCampaignsForAPI(req,res);
});

router.post('/archiveReplyIOCampaign',function (req,res) {
    ReplyIOController.archiveReplyIOCampaignsForAPI(req,res);
});


/**
 * this is route for post data from replyIOPeopleUpdateTask
 */
router.post('/replyIOReplies',function (req,res) {
    ReplyIOController.updateCampaignRepliesViaCron(req,res);
});


/**
 * this is the route for delete replyIOPeopleRecords
 * @type {Router|router}
 */
router.post('/deleteReplyIOPeople',(req,res)=>{
    ReplyIOController.deleteReplyIOPeople(req,res);
});

/**
 * delete email Queue records via API
 * @type {Router|router}
 */
router.post('/deleteEmailQueueRecords',(req,res)=>{
    EmailQueueController.deleteEmailQueueRecords(req,res);
});

router.post('/getAngleCompanies',(req,res)=>{
    AngleController.getCompanies(req,res);
});

router.post('/angleCompany',(req,res)=>{
    AngleController.saveCompanyRecordsViaCron(req,res);
});

router.delete('/angleCompany',(req,res)=>{
    AngleController.deleteAngleCompany(req,res);
});

router.post('/scraper',(req,res)=>{
    ScraperController.addNewScraper(req,res);
});

router.post('/searchScrapers',(req,res)=>{
    ScraperController.searchScrapers(req,res);
});

router.post('/sendScraperEmail',function(req,res){
    if(req.body.angleSecret==mainConfig.angleSecret){
        ScraperEmailController.sendInstantEmail(req,res);
    }
    else {
        res.status(400).send({msg:'Invalid Token'});
    }

});


router.post('/manychatwebhook',function(req,res){

        res.status(200).send({msg:'success'});

});

router.get('/searchUlinc',function (req,res) {
    if(mainConfig.angleSecret == req.query.access_token){
        CampaignController.search(req,res);
    }
    else {
        res.status(400).send({});
    }

});
module.exports = router;
