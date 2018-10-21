const CampaignController = {};
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');



CampaignController.newCampaign = function(req,res){

    try {
        Company.getCompanyList(function (err,companyList) {
            if(err){
                res.render('error',{error:''});
            }
            else {
                res.render('addCampaign',{companyList:companyList});

            }
        });
    }
    catch (e) {
        res.render('error',{error:''});
    }
};

CampaignController.addNewCampaign = function(req,res){

    try {
        const newCampaignRecord = new CampaignRecord(req.body);
        CampaignRecord.addCampaignRecord(newCampaignRecord,function (err, result) {

            if(err){
                res.status(500).send({error:err});
            }
            else {
                res.status(200).send({});
            }
        });
    }
    catch (e) {
        res.status(500).send({error:e});
    }
};

CampaignController.search = function(req,res){

    try {
        const options = {sort:{companyName:-1}};
        const pagination = { skip: 10*req.body.next,limit: 10 };
        CampaignRecord.getNextResultSet({},options,pagination,function (err,data) {
            if(err){
                res.status(500).send({error:err});
            }
            else {
                console.log(data);
                res.status(200).send({rowData:data});
            }
        })
    }catch (e) {
        res.status(500).send({error:e});
    }
};

CampaignController.saveCampaignRecord = function(req,res){
    try {
        CampaignRecord.findByIdAndUpdate(req.body.campId, { $set:
                {
                    prospects: req.body.prospects ,
                    delivered: req.body.delivered ,
                    opened: req.body.opened ,
                    response: req.body.response ,
                    customCol1: req.body.customCol1 ,
                    customCol2: req.body.customCol2 ,
                    customCol3: req.body.customCol3 ,
                    deliveredPercentage: Math.floor(100*req.body.delivered/req.body.prospects) ,
                    openedPercentage: Math.floor(100*req.body.opened/req.body.delivered) ,
                    responsesPercentage: Math.floor(100*req.body.response/req.body.delivered) ,
                }}, {new: true}, function (err,data) {
            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(200).send({result:data});
            }
        });
    }
    catch (e) {
        res.status(500).send({err:e});
    }


};
module.exports = CampaignController;