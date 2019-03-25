const ReplyIOCompanyController = {};
const ReplyIOCompany = require('../../model/replyIOCompany');
const ReplyIOPeople = require('../../model/replyIOPeople');
const ReplyIOCampaignRecord = require('../../model/replyIOCampaignRecord');


ReplyIOCompanyController.addNewCompany = function (req,res) {
    try {
        const newCompany = req.body;
        // newCompany.isActive = 1;
        Company.addCompany(Company(newCompany),function (err,company) {
            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(200).send({});
            }
        });
    }
    catch (e) {
        res.status(500).send({err:e});
    }
};
ReplyIOCompanyController.updateCompany = function(req,res){
    try {
        if(req.body.updateObject != undefined && req.body.updateObject.sendTo == undefined){
            req.body.updateObject.sendTo = [];
        }
        ReplyIOCompany.update({_id:req.body.id},{$set:req.body.updateObject?req.body.updateObject:req.body},function (err,data) {

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

ReplyIOCompanyController.editCompany = function(req,res){

    try {
        console.log(req.params.id);
        ReplyIOCompany.findById(req.params.id,function (err,data) {
            if(err){
                res.render("error",{error:''});
            }
            else {
                if(data==null){
                    res.render("error",{error:'Invalid Company'});
                }
                else {
                    console.log(data);
                    res.render('editReplyIOCompany',{company:data});
                }

            }
        })
    }
    catch (e) {
        res.render("error",{error:''});
    }
};

ReplyIOCompanyController.readCompanyFromDatabase = function(req, res){
    try {
        Company.getCompanyList(function (err,items) {
            if(err){
                res.render('error',{error:''});
            }
            else {
                res.render('companylist',{'items':items});

            }
        });
    }
    catch (e) {
        res.render('error',{error:''});
    }

};


ReplyIOCompanyController.deleteCompanyFromDatabase = function (req,res) {
    try {
        ReplyIOCompany.findByIdAndRemove(req.params.id,function (err,data) {
            res.redirect('/replyIOcompanies');
            // check this behaviour
            // CampaignRecord.deleteCampaignRecordsByCompanyId(req.params.id,function (err,data) {
            //     return true;
            // });
        });
    }
    catch (e) {
        res.render('error',{error:''});
    }

};


ReplyIOCompanyController.getReplyIOCompanyReach = function(req,res){
    try {
        const perPage = 20;
        const options= {
            sort: req.body.sortParams,
            skip: perPage*Number(req.body.pageNumber),
            limit: perPage
        };
        console.log(req.body.searchParams.campaignIdList);
        if(req.body.searchParams.campaignIdList.length==''){

            ReplyIOCampaignRecord.getCampaignList({},function (err,data) {
                if(err){
                    console.log(err);
                }
                else {

                    const campaignIdList = data.
                    filter(d => d.name.split("-").length>1 && d.name.split("-")[1].trim()==req.body.companyName.trim())
                        .map(o => o.id);

                    ReplyIOPeople.getPeopleList({campaignId:{$in:campaignIdList}},null,options,function (err,data) {

                        if(err){
                            console.log(err);
                            res.status(400).send({msg:'Could not load the list',e:err});
                        }
                        else {
                            res.status(200).send({list:data,campaignIdList:campaignIdList});
                        }
                    })

                }
            });
        }
        else {
            ReplyIOPeople.getPeopleList({campaignId:{$in:req.body.searchParams.campaignIdList}},null,options,function (err,data) {

                if(err){
                    console.log(err);
                    res.status(400).send({msg:'Could not load the list',e:err});
                }
                else {
                    res.status(200).send({list:data,campaignIdList:req.body.searchParams.campaignIdList});
                }
            })
        }




    }
    catch (e) {
        console.log(e);
        res.status(500).send({msg:'Could not load the list',e:e})
    }
};

module.exports = ReplyIOCompanyController;