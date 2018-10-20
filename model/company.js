const mongoose = require('mongoose');

const CompanySchema = mongoose.Schema({
    companyName : {
        type : String
    },
    defaultMailDays : {
        type: [Number],
        default: undefined
    },
    emailColumns : {
        type: [Number],
        default: undefined
    },
    senderEmail:{
        type: String,
    },
    senderPassword:{
        type: String
    },
    sendTo:{
        type: [String],
        default: undefined
    },
    isActive:{
        type: Number,
        default: 1
    }


});

const Company = module.exports = mongoose.model('Company',CompanySchema);


module.exports.getCompanyList = function(callback){
    Company.find({},null,{sort:{companyName:1}},callback);
};
module.exports.getItemById = function (id, callback) {

};

module.exports.addCompany = function (company,callback) {
    company.save(callback);
};

module.exports.deleteCompany = function (id,callback) {
  Company.findByIdAndRemove(id,callback);
};

module.exports.updateCompany = function (id,update,callback) {
    Company.findByIdAndUpdate(id, update, callback)
};
