const CampaignController = {};
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');
const jetbuzzCredintials = require('./config/jetbuzzCredintials');



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
        newCampaignRecord.deliveredPercentage = isNaN(Math.floor(100*newCampaignRecord.delivered/newCampaignRecord.prospects))?0 :Math.floor(100*newCampaignRecord.delivered/newCampaignRecord.prospects);
        newCampaignRecord.openedPercentage = newCampaignRecord.prospects != 0 ? Math.floor(100*newCampaignRecord.opened/newCampaignRecord.prospects) : 0;
        newCampaignRecord.responsesPercentage = newCampaignRecord.prospects != 0 ? Math.floor(100*newCampaignRecord.response/newCampaignRecord.prospects): 0;
        CampaignRecord.addCampaignRecord(newCampaignRecord,function (err, result) {

            if(err){
                res.status(500).send({error:err});
            }
            else {
                res.status(200).send({data:result});
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
                    status: req.body.status ,
                    prospects: req.body.prospects ,
                    delivered: req.body.delivered ,
                    opened: req.body.opened ,
                    response: req.body.response ,
                    customCol1: req.body.customCol1 ,
                    customCol2: req.body.customCol2 ,
                    customCol3: req.body.customCol3 ,
                    deliveredPercentage: isNaN(Math.floor(100*req.body.delivered/req.body.prospects))? 0: Math.floor(100*req.body.delivered/req.body.prospects) ,
                    openedPercentage: isNaN(Math.floor(100*req.body.opened/req.body.delivered))? 0 : Math.floor(100*req.body.opened/req.body.delivered) ,
                    responsesPercentage: isNaN(Math.floor(100*req.body.response/req.body.delivered))? 0 : Math.floor(100*req.body.response/req.body.delivered) ,
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
CampaignController.updateCampaignRecordViaJetbuzz = function(req,res){
    try {
        if(req.body.jetbuzzSecret == jetbuzzCredintials.jetbuzzSecret){
            Company.find({'accountEmail':req.body.accountEmail},function (err,data) {
                if(err){
                    console.log(err);
                    res.status(500).send({err:err});
                }

                else {
                    if(data.length>0){
                        CampaignRecord.findOneAndUpdate({companyId:data[0]._id}, { $set:
                                {
                                    customCol1: req.body.connectionRequest ,
                                    customCol2: req.body.connected ,
                                    customCol3: req.body.replied_to_other_messages ,
                                    customCol4: req.body.replied_to_connection ,
                                }}, {new: true}, function (err,data) {
                            if(err){
                                res.status(500).send({err:err});
                            }
                            else {
                                res.status(200).send({result:data});
                            }
                        });
                    }
                    else {
                        res.status(200).send({msg:"No Matching campaign found for "+req.body.accountEmail});
                    }

                }
            });
        }
        else {
            res.status(400).send({'error':'Bad request'});
        }

    }
    catch (e) {
        res.status(500).send({err:e});
    }


};
module.exports = CampaignController;