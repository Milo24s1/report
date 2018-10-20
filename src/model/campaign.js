const CampaignController = {};
const Company = require('../../model/company');

CampaignController.search = function(req,res){



};

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

module.exports = CampaignController;