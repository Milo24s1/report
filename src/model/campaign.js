const moment = require('moment');
const CampaignController = {};
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');
const People = require('../../model/people');
const jetbuzzCredintials = require('../../config/jetbuzzCredintials');



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
        const options = {sort:{companyName:1}};
        const pagination = { sort:{companyName:1},skip: 10*req.body.next,limit: 10 };
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
                    campaignName: req.body.campaignName ,
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

CampaignController.updateCampaignRepliesViaJetbuzz = function(req,res){
    try {
        if(req.body.jetbuzzSecret == jetbuzzCredintials.jetbuzzSecret){
            Company.find({'accountEmail':req.body.accountEmail},function (err,data) {
                if(err){
                    console.log(err);
                    res.status(500).send({err:err});
                }

                else {
                    if(data.length>0){
                        CampaignRecord.find({companyId:data[0]._id},  function (err,data) {
                            if(err){
                                res.status(500).send({err:err});
                            }
                            else {
                                if(data.length>0){
                                    //TODO currently multiple campaigns are not supported
                                    if(data.length==1){
                                        const replies =req.body.replies;
                                        let peopleRecords = [];
                                        for(let reply of replies){
                                            reply.companyId = data[0].companyId;
                                            reply.campaignId= ''+data[0]._id;
                                            reply.addedDate= moment();
                                            peopleRecords.push(reply);

                                        }

                                        People.addPeopleRecord(peopleRecords,(err,data)=>{

                                            if(err){
                                                console.log(err);
                                                res.status(200).send({msg:err});
                                            }
                                            else {
                                                res.status(200).send({msg:data});
                                            }
                                        });



                                    }
                                    else {
                                        res.status(200).send({msg:"Multiple Campaigns found for "+req.body.accountEmail});
                                    }
                                }
                                else {
                                    res.status(200).send({msg:"No Matching campaign found for "+req.body.accountEmail});
                                }

                            }
                        });
                    }
                    else {
                        res.status(200).send({msg:"No Matching Company found for "+req.body.accountEmail});
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

CampaignController.getCampaignRepliedList = function(req,res){
    try {
        const perPage = 20;
        const options= {
            sort: req.body.sortParams,
            skip: perPage*Number(req.body.pageNumber),
            limit: perPage
        };
        People.getPeopleList(req.body.searchParams,null,options,function (err,data) {

            if(err){
                console.log(err);
                res.status(400).send({msg:'Could not load the list',e:err});
            }
            else {
                res.status(200).send({list:data});
            }
        })
    }
    catch (e) {
        console.log(e);
        res.status(500).send({msg:'Could not load the list',e:e})
    }
};

CampaignController.genrateLinkdinReachCSV = function(req,res){
    try {

        const Json2csvParser = require('json2csv').Parser;
        const fields = [
                        {label:'Name',value:'name'},
                        {label:'Company',value:'pCompany'},
                        {label:'Title',value:'title'},
                        {label:'Phone',value:'phone'},
                        {label:'Email',value:'email'},
                         ];
        const json2csvParser = new Json2csvParser({ fields });
        const options= {
            sort: {addedDate:-1}
        };
        People.getPeopleList({campaignId:req.params.campaignId},null,options,function (err,data) {

            if(err){
                console.log(err);
                res.status(400).send({msg:'Could not load the list',e:err});
            }
            else {
                const csv = json2csvParser.parse(data);

//TODO set company name as file name
                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);

            }
        })
    }
    catch (e) {
        console.log(e);
    }
};
module.exports = CampaignController;