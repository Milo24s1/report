const moment = require('moment');
const request = require('request');
const mongoose = require('mongoose');
const Company = require('./model/company');
const EmailController = require('./src/model/email');
const jetbuzzConfig = require('./config/jetbuzzCredintials');
// const DASHBOARD_URL = 'http://localhost:9999';
const DASHBOARD_URL = 'http://dash.prospectgenai.com';
let systemDate = moment().format("YYYY-MM-DD");
if(process.argv.length==3){
    systemDate = process.argv[2];
}
console.log(moment(systemDate).isoWeekday());



function getCompanyListAsync(){

    return new Promise(function (resolve,reject) {
            const postOptions = {
                jar: true,
                followAllRedirects: true,
                method: 'POST',
                url:DASHBOARD_URL+'/api/getJetbuzzCompanyList',
                form : {
                  'jetbuzzSecret':jetbuzzConfig.jetbuzzSecret
                }
            };
            request.post(postOptions,(err,response,html)=>{
               if(err){
                   resolve([]);
               }
               else {
                   resolve(JSON.parse(html).companylist);
               }
            });
    })
}

async function run() {
    try {
        let companies = await getCompanyListAsync();
        for (let company of companies) {

            const dayOfweek = moment(systemDate).isoWeekday();
            if(company.defaultMailDays != undefined){
                if(company.defaultMailDays.indexOf(dayOfweek)>-1 && company.status != 'DELETED'){

                    let emailPostOptions = {
                        jar: true,
                        followAllRedirects: true,
                        method: 'POST',
                        url:DASHBOARD_URL+'/api/sendJetbuzzEmail',
                        form : {
                            'jetbuzzSecret':jetbuzzConfig.jetbuzzSecret,
                            'companyId':company._id
                        }
                    };

                    request.post(emailPostOptions,(err,response,html)=>{
                        if(err){
                            console.log('Error occured'+err);
                        }
                        else {
                            console.log(html);
                        }
                    });
                }
            }
            else {
                console.log(`defaultMailDays is not set for ${company.companyName}`);
            }
        }

    }
    catch (e) {
        console.log(e);
    }
}
run();

