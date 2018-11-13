const CompanyController = {};
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');


CompanyController.addNewCompany = function (req,res) {
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
CompanyController.updateCompany = function(req,res){
    try {
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


CompanyController.deleteCompanyFromDatabase = function (req,res) {
    Company.deleteCompany(req.params.id,function (err,data) {
        res.redirect('/companies');
        CampaignRecord.deleteCampaignRecordsByCompanyId(req.params.id,function (err,data) {
            return true;
        });
    });
};



module.exports = CompanyController;