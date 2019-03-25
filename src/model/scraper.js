const ScraperController = {};
const Scraper = require('../../model/scraper');
const CampaignRecord = require('../../model/campaignRecord');
const mainConfig = require('../../config/mainConfig');


ScraperController.addNewScraper = function (req,res) {
    try {

        if(req.body.angleSecret==mainConfig.angleSecret){
            const newScraper = req.body.scraper;
            newScraper.isActive = 1;
            Scraper.addScraper(Scraper(newScraper),function (err,scraper) {
                if(err){
                    res.status(500).send({err:err});
                }
                else {
                    res.status(200).send({scraper:scraper});
                }
            });
        }
        else {
            res.status(400).send({msg:'Invalid Secret'});
        }

    }
    catch (e) {
        res.status(500).send({err:e});
    }
};
ScraperController.updateScraper = function(req,res){

        try {
            if(req.body.updateObject != undefined && req.body.updateObject.sendTo == undefined){
                req.body.updateObject.sendTo = [];
            }
            Scraper.update({_id:req.body.id},{$set:req.body.updateObject?req.body.updateObject:req.body},function (err,data) {

                if(err){
                    console.log(err);
                    res.status(400).send({err:err});
                }
                else {
                    res.status(200).send({data:data});

                }
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).send({err:e});
        }
};

ScraperController.editScraper = function(req,res){

    try {
        Company.getItemById(req.params.id,function (err,data) {
            if(err){
                res.render("error",{error:''});
            }
            else {
                if(data==null){
                    res.render("error",{error:'Invalid Scraper'});
                }
                else {
                    console.log(data);
                    res.render('editCompany',{company:data});
                }

            }
        })
    }
    catch (e) {
        res.render("error",{error:''});
    }
};

ScraperController.readScraperFromDatabase = function(req, res){
    try {
        Scraper.getScraperList({},function (err,items) {
            if(err){
                res.render('error',{error:''});
            }
            else {

                res.render('scraperlist',{'items':items});

            }
        });
    }
    catch (e) {
        res.render('error',{error:''});
    }

};

ScraperController.searchScrapers = function(req, res){
    try {
        if(req.body.angleSecret== mainConfig.angleSecret){
            Scraper.getScraperList(req.body.query,function (err,items) {
                if(err){
                    res.send({'scraperlist':[]});
                }
                else {
                    res.send({'scraperlist':items});

                }
            });
        }
        else {
            res.send({'scraperlist':[]});
        }

    }
    catch (e) {
        res.send({'companylist':[]});
    }

};


ScraperController.deleteCompanyFromDatabase = function (req,res) {
    Company.deleteCompany(req.params.id,function (err,data) {
        res.redirect('/companies');
        CampaignRecord.deleteCampaignRecordsByCompanyId(req.params.id,function (err,data) {
            return true;
        });
    });
};



module.exports = ScraperController;