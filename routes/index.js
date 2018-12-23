const express = require('express');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');
const EmailController = require('../src/model/email');
const ReplyIOEmailController = require('../src/model/replyIOemail');
const ReplyIOController = require('../src/model/replyIO');
const ReplyIOCompanyController = require('../src/model/replyIOcompany');

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

router.post('/updateCompany',function (req,res) {
    CompanyController.updateCompany(req,res);
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

router.post('/getCampaignReach',function (req,res) {
   CampaignController.getCampaignRepliedList(req,res);
});

router.get('/replyIOHome',(req,res)=>{
    res.render('replyIOHome')
});

router.get('/getReplyIOCampaigns',(req,res)=>{
    ReplyIOController.getReplyIOCampaigns(req,res);
});

router.get('/replyIOcompanies',(req,res)=>{
   ReplyIOController.getReplyIOCompanies(req,res);
});

router.post('/sendReplyIOEmail',function (req,res) {
    ReplyIOEmailController.sendInstantEmail(req,res);
});

router.get('/editReplyIOCompany/:id', function(req, res){
    ReplyIOCompanyController.editCompany(req,res);
});

router.post('/updateReplyIOCompany',function (req,res) {
    ReplyIOCompanyController.updateCompany(req,res);
});

router.get('/deleteReplyIOCompany/:id', function(req, res){
    ReplyIOCompanyController.deleteCompanyFromDatabase(req,res);
});

router.post('/getReplyIOCompanyReach',function (req,res) {
    ReplyIOCompanyController.getReplyIOCompanyReach(req,res);
});

module.exports = router;
