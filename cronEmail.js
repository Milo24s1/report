const moment = require('moment');
const mongoose = require('mongoose');
const Company = require('./model/company');
const EmailController = require('./src/model/email');
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
        Company.getCompanyList(function (err,data) {
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
                if(company.defaultMailDays.indexOf(dayOfweek)>-1 && company.status != 'DELETED'){
                    jobCount++;
                    EmailController.sendCompanyEmail(company._id,null,null,null,null,function (status,message) {
                       console.log(status+':'+message);
                        jobCount--;

                        if(jobCount==0){
                            mongoose.disconnect();
                        }
                    });
                }
            }
            else {
                console.log(`Receivers are not set for ${company.companyName}`);
            }
        }
        console.log('call end of ');
    }
    catch (e) {
        console.log('errr');
        console.log(e);
    }
}
run();

