const mongoose = require('mongoose');

const EmailQueueSchema = mongoose.Schema({
    type:{
        type:String
    },
    status:{
        type:String
    },
    message:{
        type:String
    },
    loggedDate:{
        type:Date
    },
    company:{
        type:String,
        default:''
    },
    senderEmail:{
        type:String,
        default:''
    },
    receivers:{
        type:String
    }

});

const EmailQueue= module.exports = mongoose.model('EmailQueue',EmailQueueSchema);

module.exports.getEmailQueueList = function(searchParams,fields,options,callback){
    EmailQueue.find(searchParams,fields,options,callback);
};

module.exports.addEmailRecords = function(records,callback){
    EmailQueue.insertMany(records,{ordered:false},callback);
};

module.exports.addEmailRecord = function(EmailQueueRecord,callback){
    EmailQueueRecord.save(callback);
};
module.exports.removeRecords = function (condition,callback) {
    EmailQueue.remove(condition,callback);
};