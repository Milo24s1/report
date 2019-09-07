const ReplyIOController = require('./src/model/replyIO');
const ReplyIOCampaignRecord = require('./model/replyIOCampaignRecord');
const ReplyIOCompany = require('./model/replyIOCompany');
const mongoose = require('mongoose');
const replyIOConfig = require('./config/replyIOConfig');
const config = require('./config/credintials');

run();

async function run() {


    mongoose.connect(config.database);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useNewUrlParser', true);
    mongoose.connection.on('connected',()=>{
        console.log('connected to '+config.database);
    });
    mongoose.connection.on('error',(error)=>{
        console.log('Database error '+error);
    });

    const existingCompanyList = await getExistingCompanyList();
    const existingCompanyNameList = Object.keys(existingCompanyList);
    const updatedCompanyNameList = [];
    let jobCount = 0;

    try {
        ReplyIOCampaignRecord.getCampaignList({},(error,data)=>{

            if(error){
                console.log(error);
            }
            else {

                for(let campaign of data){
                    console.log(campaign.name);
                    if(campaign.name.split("-").length>1){
                        const companyName = campaign.name.split("-")[1].trim();
                    }
                    else {
                        console.log('invalid campaign name '+campaign.name);
                        continue;
                    }


                    if(existingCompanyNameList.includes(companyName) || updatedCompanyNameList.includes(companyName)){
                        //handle this
                        console.log(companyName+ " is an existing company");
                    }
                    else {
                        // new company or previous company name has been changed
                        jobCount++;
                        updatedCompanyNameList.push(companyName);
                        const newComapny = ReplyIOCompany({
                            name : companyName,
                            defaultMailDays : replyIOConfig.defaultMailDays,
                            emailColumns: replyIOConfig.emailColumns,
                            senderEmail: replyIOConfig.senderEmail,
                            senderPassword: replyIOConfig.senderPassword,
                            sendTo : [],
                            isActive: 1,
                            defaultMessage: '',
                            campaignIdList: []
                        });

                        ReplyIOCompany.addCompany(newComapny,(error,data)=>{
                           if(error){
                               console.log(error);
                           }
                           else {
                               console.log(data.name+ ' Company Added Successfully');
                           }
                           jobCount--;
                           if (jobCount==0){
                               mongoose.disconnect();
                           }
                        });
                    }
                }

                if (jobCount==0){
                    mongoose.disconnect();
                }
            }
        });
    }
    catch (e) {
        console.log('catch---------> '+e);
    }
}

function getExistingCompanyList() {
    const companyMap = {};
    return new Promise(resolve => {

        try {
            ReplyIOCompany.getCompanyList({},null,null,(err,data)=>{
                console.log('callback invoked');
                if(err){
                   console.log('error---> '+err);
                   resolve({});
                }
                else {

                    for(let d of data){
                        companyMap[d.name] = data;
                    }

                    resolve(companyMap);
                }

            });
        }
        catch (e) {
            console.log('catch in comapny list fetch');
            resolve({});
        }
    });
}