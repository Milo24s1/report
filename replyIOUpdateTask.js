const ReplyIOController = require('./src/model/replyIO');
const ReplyIOCampaignRecord = require('./model/replyIOCampaignRecord');
const mongoose = require('mongoose');
const config = require('./config/credintials');

function getCampaignIdList(){
    const idArray = [];

    return new Promise(resolve => {
        try {
            ReplyIOCampaignRecord.getCampaignList({status:'Active'},function(error,data){
                console.log('callback called');
                if(error){
                    console.log(error);
                    resolve(idArray);
                }
                else {
                    for(let d of data){
                        idArray.push(d.id) ;
                    }
                    resolve(idArray);
                }

            }) ;
        }
        catch (e) {
            console.log('catch'+e);
            resolve(idArray);
        }

    });
}
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

    try {

       const campaignIdList = await getCampaignIdList();
       var connecationCount = 0;

       // mongoose.disconnect();
       const apiResponse = await ReplyIOController.callReplyIOAPI('campaigns','GET');
       const formattedResponse = JSON.parse(apiResponse);

       for(let record of formattedResponse){
           connecationCount++;
           if(campaignIdList.includes(record.id)){
               //update record
               ReplyIOCampaignRecord.findOneAndUpdate({id:record.id},{ $set: record},function (err,data) {
                   if(err){
                       console.log(err);
                   }
                   else {
                       console.log('Updated sucessfully');
                   }
                   connecationCount--;
                   if(connecationCount==0){
                       mongoose.disconnect();
                   }
               });
           }
           else {
               //insert record
               const newCampaignRecord = new ReplyIOCampaignRecord(record);
               newCampaignRecord.status = 'Active';
               console.log(newCampaignRecord);
               ReplyIOCampaignRecord.addCampaignRecord(newCampaignRecord,function (err,data) {

                   if(err){
                       console.log(err);
                   }
                   else {
                       console.log('Added sucessfully');
                       console.log(data);
                       connecationCount--;
                       if(connecationCount==0){
                           mongoose.disconnect();
                       }
                   }
               });

           }
       }

       //Archive if not updated

    }
    catch (e) {
        console.log(e);
    }
}



run();