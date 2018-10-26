const express = require('express');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');
const EmailController = require('../src/model/email');

/*
GET home page
 */
router.get('/',(req,res,next)=>{
    res.render('index');
});

router.get('/newcompany', function(req, res){
    res.render('add');
});

router.post('/addNewCompany',(req,res,next)=>{
    CompanyController.addNewCompany(req,res);
});

router.get('/editCompany/:id', function(req, res){
    CompanyController.editCompany(req,res);
});

router.get('/companies', function(req, res){
    CompanyController.readCompanyFromDatabase(req,res);

});

router.get('/deleteCompany/:id', function(req, res){
    CompanyController.deleteCompanyFromDatabase(req,res);

});

router.get('/newcampaign', function(req, res){
    CampaignController.newCampaign(req,res);
});

router.post('/addNewCampaign', function(req, res){
    CampaignController.addNewCampaign(req,res);
});

router.post('/search',function (req,res) {
    CampaignController.search(req,res);
});

router.post('/saveCampaignRecord',function (req,res) {
    CampaignController.saveCampaignRecord(req,res);
});

router.post('/sendEmail',function (req,res) {
    EmailController.sendInstantEmail(req,res);
});




module.exports = router;
