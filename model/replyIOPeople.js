const mongoose = require('mongoose');

const replyIOPeopleSchema = mongoose.Schema({
    id:{
        type:String
    },
    email:{
        type:String
    },
    name:{
        type:String
    },
    title:{
        type:String
    },
    campaignId:{
        type:String
    },
    lastReplyDate:{
        type:Date
    },
    addedDate:{
        type: Date
    }

});

replyIOPeopleSchema.index({ email: 1, campaignId: 1}, { unique: true });

const ReplyIOPeopleRecord = mongoose.model('ReplyIOPeopleRecord',replyIOPeopleSchema);

module.exports.addPeopleRecord = function(records,callback){
    console.log('callin db method');
    ReplyIOPeopleRecord.insertMany(records,{ordered:false},callback);
};

module.exports.getPeopleList = function(searchParams,fields,options,callback){
    ReplyIOPeopleRecord.find(searchParams,fields,options,callback);
};

module.exports.removeRecords = function (condition,callback) {
    ReplyIOPeopleRecord.remove(condition,callback);
};

