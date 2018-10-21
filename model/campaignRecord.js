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
    },
    deliveredPercentage:{
        type: Number,
        default: 0
    },
    openedPercentage:{
        type: Number,
        default: 0
    },
    responsesPercentage: {
        type: Number,
        default: 0
    }
});


const CampaignRecord = module.exports = mongoose.model('CampaignRecord',CampaignRecordSchema);

module.exports.addCampaignRecord = function (campaign,callback) {
    campaign.save(callback);
};

module.exports.getCampaignRecordsByToken = function (token,callback) {
    const query = {'token':token};
    CampaignRecord.find(query,callback);
};

module.exports.getCampaignRecordByCampaignId = function (campId,callback) {
    const query = {'_id':campId};
    CampaignRecord.find(query,callback);
};

module.exports.getNextResultSet = function (searchParams,options,pagination,callback) {
    // CampaignRecord.find(searchParams,null,options,callback);
    CampaignRecord.find({},null,pagination,callback);
};

module.exports.deleteCampaignRecordsByCompanyId = function (companyId,callback) {
    CampaignRecord.deleteMany({companyId: companyId},callback);
};


