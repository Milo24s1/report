const mongoose = require('mongoose');

const ScraperSchema = mongoose.Schema({
    scraperName : {
        type : String
    },
    defaultMailDays : {
        type: [Number],
        default: []
    },
    emailColumns : {
        type: [Number],
        default: [1,2,3,4,5,6]
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
    pageLink:{
        type: String
    }


});

const Scraper = module.exports = mongoose.model('Scraper',ScraperSchema);


module.exports.getScraperList = function(query,callback){
    Scraper.find(query,null,{sort:{scraperName:1}},callback);
};
module.exports.getItemById = function (id, callback) {
    Scraper.findById(id,callback);
};

module.exports.addScraper = function (scraper,callback) {
    scraper.save(callback);
};

module.exports.deleteScraper = function (id,callback) {
    Scraper.findByIdAndRemove(id,callback);
};

module.exports.updateScraper = function (id,update,callback) {
    Scraper.findByIdAndUpdate(id, update, callback)
};
