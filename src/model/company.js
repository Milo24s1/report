const CompanyController = {};
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');


CompanyController.addNewCompany = function (req,res) {
    try {
        const newCompany = req.body;
        newCompany.deliveredPercentage = Math.floor(100*newCompany.delivered/newCompany.prospects);
        newCompany.openedPercentage = prospects != 0 ? Math.floor(100*newCompany.opened/newCompany.prospects) : 0;
        newCompany.responsesPercentage = prospects != 0 ? Math.floor(100*newCompany.response/newCompany.prospects): 0;
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