const moment = require('moment');
const mongoose = require('mongoose');
const ReplyIOCompany = require('./model/replyIOCompany');
const ReplyIOEmailController = require('./src/model/replyIOemail');
const config = require('./config/credintials');
var jobCount = 0;
let systemDate = moment().format("YYYY-MM-DD");
if(process.argv.length==3){
    systemDate = process.argv[2];
}
console.log(moment(systemDate).isoWeekday());

mongoose.connect(config.database);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connection.on('connected',()=>{
    console.log('connected to '+config.database);
});
mongoose.connection.on('error',(error)=>{
    console.log('Database error '+error);
});

function getCompanyListAsync(){

    return new Promise(function (resolve,reject) {
        ReplyIOCompany.find({isActive:1},function (err,data) {
            if(err){
                resolve([]);
            }
            else {
                resolve(data);
            }
        })
    })
}

async function run() {
    try {
        let companies = await getCompanyListAsync();
        for (let company of companies) {

            const dayOfweek = moment(systemDate).isoWeekday();
            if(company.defaultMailDays != undefined){
                if(company.defaultMailDays.indexOf(dayOfweek)>-1){
                    jobCount++;
                    ReplyIOEmailController.sendCompanyEmail(company._id,null,null,null,null,function (status,message) {
                       console.log(status+':'+message);
                        jobCount--;

                        if(jobCount==0){
                            mongoose.disconnect();
                        }
                    });
                }
            }
            else {
                console.log(`Default mail sending day is not set for ${company.name}`);
            }
        }

    }
    catch (e) {
        console.log('errr');
        console.log(e);
    }
}
run();

