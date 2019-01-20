const CompanyController = {};
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');
const jetbuzCredintials = require('../../config/jetbuzzCredintials');


CompanyController.addNewCompany = function (req,res) {
    try {
        const isAutoCamp = req.body.isAutoCamp;
        delete req.body.isAutoCamp;
        const newCompany = req.body;
        // newCompany.isActive = 1;
        Company.addCompany(Company(newCompany),function (err,company) {
            if(err){
                res.status(500).send({err:err});
            }
            else {
                if(isAutoCamp==1){

                    const newCampaignRecord = new CampaignRecord({
                        campaignName: 'LinkedIn Prospecting',
                        companyId: company._id,
                        companyName: company.companyName,
                        customCol1:0,
                        customCol2:0,
                        customCol3:0,
                        customCol4:0,
                        delivered:0,
                        opened:0,
                        prospects:0,
                        response:0,
                        status:'Running'
                    });
                    newCampaignRecord.deliveredPercentage = isNaN(Math.floor(100*newCampaignRecord.delivered/newCampaignRecord.prospects))?0 :Math.floor(100*newCampaignRecord.delivered/newCampaignRecord.prospects);
                    newCampaignRecord.openedPercentage = newCampaignRecord.prospects != 0 ? Math.floor(100*newCampaignRecord.opened/newCampaignRecord.prospects) : 0;
                    newCampaignRecord.responsesPercentage = newCampaignRecord.prospects != 0 ? Math.floor(100*newCampaignRecord.response/newCampaignRecord.prospects): 0;
                    console.log(newCampaignRecord);
                    CampaignRecord.addCampaignRecord(newCampaignRecord,function (err, result) {

                        if(err){
                            res.status(500).send({error:err});
                        }
                        else {
                            res.status(200).send({data:result});
                        }
                    });

                }
                else {
                    res.status(200).send(company);
                }
            }
        });
    }
    catch (e) {
        res.status(500).send({err:e});
    }
};
CompanyController.updateCompany = function(req,res){
    try {
        if(req.body.updateObject.sendTo == undefined){
            req.body.updateObject.sendTo = [];
        }
        Company.findByIdAndUpdate(req.body.id,req.body.updateObject,function (err,data) {

            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(200).send({data:data});

                //update company names
                CampaignRecord.update({companyId:req.body.id}, { $set:
                        {
                            companyName: req.body.updateObject.companyName ,
                        }}, {"multi": true}, function (err,data) {
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log(data);
                    }
                });

            }
        });
    }
    catch (e) {
        res.status(500).send({err:e});
    }
};

CompanyController.editCompany = function(req,res){

    try {
        Company.getItemById(req.params.id,function (err,data) {
            if(err){
                res.render("error",{error:''});
            }
            else {
                if(data==null){
                    res.render("error",{error:'Invalid Company'});
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

CompanyController.readCompanyFromDatabase = function(req, res){
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

CompanyController.getJetbuzzCompanyList = function(req, res){
    try {
        if(req.body.jetbuzzSecret== jetbuzCredintials.jetbuzzSecret){
            Company.getCompanyList(function (err,items) {
                if(err){
                    res.send({'companylist':[]});
                }
                else {
                    res.send({'companylist':items});

                }
            });
        }
        else {
            res.send({'companylist':[]});
        }

    }
    catch (e) {
        res.send({'companylist':[]});
    }

};


CompanyController.deleteCompanyFromDatabase = function (req,res) {
    Company.deleteCompany(req.params.id,function (err,data) {
        res.redirect('/companies');
        CampaignRecord.deleteCampaignRecordsByCompanyId(req.params.id,function (err,data) {
            return true;
        });
    });
};



module.exports = CompanyController;