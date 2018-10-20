const express = require('express');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');

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

router.get('/companies', function(req, res){
    CompanyController.readCompanyFromDatabase(req,res);

});

router.get('/deleteCompany/:id', function(req, res){
    CompanyController.deleteTokenFromDatabase(req,res);

});

router.get('/newcampaign', function(req, res){
    CampaignController.newCampaign(req,res);
});


router.post('/search',function (req,res) {
    woodpeker.search(req,res);
});


module.exports = router;
