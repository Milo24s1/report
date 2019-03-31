const moment = require('moment');
const request = require('request');
const mainConfig = require('./config/mainConfig');
const DASHBOARD_URL = mainConfig.dashboardUrl;
let systemDate = moment().format("YYYY-MM-DD");
if(process.argv.length==3){
    systemDate = process.argv[2];
}

function getScraperListAsync(){

    return new Promise(function (resolve,reject) {
            const postOptions = {
                jar: true,
                followAllRedirects: true,
                method: 'POST',
                url:DASHBOARD_URL+'/api/searchScrapers',
                form : {
                  'angleSecret':mainConfig.angleSecret
                }
            };
            try {
                request.post(postOptions,(err,response,html)=>{
                    if(err){
                        resolve([]);
                    }
                    else {
                        const jsonResponse = JSON.parse(html);
                        resolve(jsonResponse.scraperlist!= undefined ?jsonResponse.scraperlist:[]);
                    }
                });
            }
            catch (e) {
                console.log(e);
                resolve([]);
            }

    })
}

async function run() {
    try {
        let scrapers = await getScraperListAsync();

        for (let scraper of scrapers) {

            const dayOfweek = moment(systemDate).isoWeekday();
            if(scraper.defaultMailDays != undefined){
                if(scraper.defaultMailDays.indexOf(dayOfweek)>-1 && scraper.isActive ){

                    let emailPostOptions = {
                        jar: true,
                        followAllRedirects: true,
                        method: 'POST',
                        url:DASHBOARD_URL+'/api/sendScraperEmail',
                        form : {
                            'angleSecret':mainConfig.angleSecret,
                            'scraperId':scraper._id
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
                console.log(`defaultMailDays is not set for ${scraper.scraperName}`);
            }
        }

    }
    catch (e) {
        console.log(e);
    }
}
run();

