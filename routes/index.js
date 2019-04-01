const express = require('express');
const moment = require('moment');
const router = express.Router();
const CompanyController = require('../src/model/company');
const CampaignController = require('../src/model/campaign');
const EmailController = require('../src/model/email');
const ReplyIOEmailController = require('../src/model/replyIOemail');
const ReplyIOController = require('../src/model/replyIO');
const ReplyIOCompanyController = require('../src/model/replyIOcompany');
const EmailQueueController = require('../src/model/emailQueueController');
const ClientController = require('../src/model/client');
const ScraperController = require('../src/model/scraper');
const ScraperEmailController = require('../src/model/scraperEmail');
const AngleController = require('../src/model/angle');

/*
GET home page
 */
router.get('/',(req,res,next)=>{
    const currentTime = moment();
    const fixedtime = moment({h: 8, m: 0});
    const showDate = currentTime.isBefore(fixedtime)?moment().subtract(1, 'days').format('YYYY/MM/DD'):moment().format('YYYY/MM/DD');
    res.render('index',{showDate:showDate});
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

router.get('/emailQueue', function(req, res){
    res.render('emailQueue');
});
router.post('/getEmailQueueRecordList',function (req,res) {
    EmailQueueController.getEmailQueueRecordList(req,res);
});

router.get('/genrateLinkdinReachCSV/:campaignId',function (req,res) {
    CampaignController.genrateLinkdinReachCSV(req,res);
});

router.get('/users',function (req,res) {
   res.render('users',{items:[]}) ;
});

router.delete('/user/:id',function (req,res) {
    ClientController.deleteUser(req,res);
});
router.get('/addUser',function (req,res) {
   res.render('addUser');
});

router.post('/addUser',function (req,res) {
    ClientController.addUser(req,res);
});

router.get('/editUser',function (req,res) {

});

router.post('/editUser',function (req,res) {
    ClientController.editUser(req,res);
});
router.post('/changePassword',function (req,res) {
    ClientController.changePassword(req,res);
});

router.post('/searchUsers',function (req,res) {
    ClientController.searchUsers(req,res);
});

router.get('/anglelist',function (req,res) {
    res.render('anglelist');
});

/**
 * GET web scraper page view
 */
router.get('/scrapers', function(req, res){

    ScraperController.readScraperFromDatabase(req,res);
});

router.post('/updateScraper',function (req,res) {
    ScraperController.updateScraper(req,res);
});

router.get('/editScraper/:id', function(req, res){
    ScraperController.editScraper(req,res);
});

router.post('/sendScraperEmail',function (req,res) {
    ScraperEmailController.sendInstantEmail(req,res);
});

router.post('/getAngleCompanies',(req,res)=>{
    AngleController.getCompanies(req,res);
});
module.exports = router;
