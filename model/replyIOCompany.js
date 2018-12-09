const mongoose  = require('mongoose');

const replyIOCompanySchema = mongoose.Schema({
    name:{
        type:String,
        unique: true
    },
    defaultMailDays : {
        type: [Number],
        default: []
    },
    emailColumns : {
        type: [Number],
        default: []
    },
    senderEmail:{
        type: String,
    },
    senderPassword:{
        type: String
    },
    sendTo:{
        type: [String],
        default: []
    },
    isActive:{
        type: Number,
        default: 1
    },
    defaultMessage: {
        type: String
    },
    campaignIdList : {
        type: [Number],
        default: []
    }
});


const ReplyIOCompany = module.exports = mongoose.model('ReplyIOCompany',replyIOCompanySchema);

module.exports.addCompany = function (company,callback) {
    company.save(callback);
};

module.exports.getCompanyList = function (query,selector,options,callback) {
    if(options==null){
        options ={sort:{companyName:1}};
    }
    ReplyIOCompany.find(query,selector,options,callback);
};