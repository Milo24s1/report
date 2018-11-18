const mongoose = require('mongoose');

const PeopleSchema = mongoose.Schema({
    companyId:{
        type: String
    },
    campaignId:{
        type: String
    },
    addedDate:{
        type: Date
    },
    name:{
        type: String
    },
    pCompany:{
        type: String
    },
    title:{
        type: String
    },
    uniqueId: {
        type: String
    }
});

PeopleSchema.index({ companyId: 1, campaignId: 1, uniqueId: 1}, { unique: true });

const People = mongoose.model('People',PeopleSchema);

module.exports.getPeopleList = function(searchParams,fields,options,callback){
  People.find(searchParams,fields,options,callback);
};

module.exports.addPeopleRecord = function(records,callback){
    People.insertMany(records,{ordered:false},callback);
};


