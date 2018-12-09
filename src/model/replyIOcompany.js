const ReplyIOCompanyController = {};
const ReplyIOCompany = require('../../model/replyIOCompany');
const CampaignRecord = require('../../model/campaignRecord');


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
        if(req.body.updateObject.sendTo == undefined){
            req.body.updateObject.sendTo = [];
        }
        ReplyIOCompany.findByIdAndUpdate(req.body.id,req.body.updateObject,function (err,data) {

            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(200).send({data:data});

                //update company names
                // CampaignRecord.update({companyId:req.body.id}, { $set:
                //         {
                //             companyName: req.body.updateObject.companyName ,
                //         }}, {"multi": true}, function (err,data) {
                //     if(err){
                //         console.log(err);
                //     }
                //     else {
                //         console.log(data);
                //     }
                // });

            }
        });
    }
    catch (e) {
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



module.exports = ReplyIOCompanyController;