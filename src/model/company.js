const CompanyController = {};
const Company = require('../../model/company');


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


CompanyController.deleteTokenFromDatabase = function (req,res) {
    Company.deleteCompany(req.params.id,function (err,data) {
        res.redirect('/companies');
    });
};



module.exports = CompanyController;