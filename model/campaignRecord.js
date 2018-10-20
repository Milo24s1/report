const mongoose = require('mongoose');

const CampaignRecordSchema = mongoose.Schema({

    companyId : {
        type: String,
    },
    companyName: {
        type: String
    },
    campaignName :{
        type: String
    },
    status: {
        type: String
    },
    prospects: {
        type: Number,
        default: 0
    },
    delivered:{
        type:Number,
        default: 0
    },
    opened: {
        type: Number,
        default: 0
    },
    response:{
        type: Number,
        default:0
    },
    customCol1:{
        type: String,
        default:''
    },
    customCol2:{
        type: String,
        default:''
    },
    customCol3:{
        type: String,
        default:''
    }
});

CampaignRecordSchema.index({ token: 1, campId: 1}, { unique: true });

const CampaignRecord = module.exports = mongoose.model('CampaignRecord',CampaignRecordSchema);

module.exports.addCampaignRecord = function (campaign,callback) {
    campaign.save(callback);
};

module.exports.getCampaignRecordsByToken = function (token,callback) {
    const query = {'token':token};
    CampaignRecord.find(query,callback);
};

module.exports.getCampaignRecordByCampaignId = function (campId,callback) {
    const query = {'campId':campId};
    CampaignRecord.find(query,callback);
};


