const mongoose = require('mongoose');

const angleCompanySchema = mongoose.Schema({
    id:{
        type:Number,
        unique:true
    },
    name:{
        type:String
    },
    angleLink:{
        type:String
    },
    description:{
        type:String,
    },
    market:{
        type:String,
    },
    location:{
        type:String,
    },
    website:{
        type:String,
    },
    joined:{
        type:String,
    },
    month:{
        type:Number
    },
    year:{
        type:Number
    },
    addedDate:{
        type:Date
    }
});

const AngleCompany = module.exports = mongoose.model('AngleCompany',angleCompanySchema);

module.exports.addCompany = function (company,callback) {
    company.save(callback);
};

module.exports.addCompanyRecords = function(records,callback){
    AngleCompany.insertMany(records,{ordered:false},callback);
};

module.exports.getCompanyList = function (query,selector,options,callback) {
    if(options==null){
        options ={sort:{id:1}};
    }
    AngleCompany.find(query,selector,options,callback);
};

module.exports.removeRecords = function (condition,callback) {
    AngleCompany.remove(condition,callback);
};