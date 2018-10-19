const CompanyController = {};


CompanyController.addTokenToDatabase = function (req,res) {

};


CompanyController.readCompanyFromDatabase = function(req, res){
    res.render('add');

    // Company.getCompanyList(function (err,result) {
    //     console.log('callback is called');
    //     if(err){
    //         console.log(err);
    //         res.render('add',{'itms':[]});
    //     }
    //     else {
    //         res.render('add',{'itms':result});
    //
    //     }
    // });
};



module.exports = CompanyController;