const mongoose  = require('mongoose');

const ReplyIOCampaignRecordSchema = mongoose.Schema({
    id:{
        type: Number,
        unique: true
    },
    name:{
        type: String
    },
    created:{
        type: Date
    },
    emailAccount:{
        type: String
    },
    deliveriesCount:{
        type:Number
    },
    opensCount:{
        type:Number
    },
    repliesCount:{
        type:Number
    },
    bouncesCount:{
        type:Number
    },
    optOutsCount:{
        type:Number
    },
    outOfOfficeCount:{
        type:Number
    },
    peopleCount:{
        type:Number
    },
    peopleFinished:{
        type:Number
    },
    peopleActive:{
        type:Number
    },
    peoplePaused:{
        type:Number
    },
    status:{
        type: String
    }


});


const ReplyIOCampaignRecord = module.exports = mongoose.model('ReplyIOCampaignRecord',ReplyIOCampaignRecordSchema);

module.exports.getCampaignList = function (query,callback) {
    ReplyIOCampaignRecord.find(query,callback);
};

module.exports.addCampaignRecord = function (campaign,callback) {
    campaign.save(callback);
};