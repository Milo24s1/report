const ReplyIOController = require('./src/model/replyIO');
const ReplyIOCampaignRecord = require('./model/replyIOCampaignRecord');
const mongoose = require('mongoose');
const config = require('./config/credintials');

/**
 * return diff of two arrays
 * @param a1
 * @param a2
 * @returns {Uint8Array}
 */
function diff(a1, a2) {
    return a1.concat(a2).filter(function(val, index, arr){
        return arr.indexOf(val) === arr.lastIndexOf(val);
    });
}

/**
 * fetch existing campaign records from database
 * @returns {Promise<any>}
 */
function getCampaignIdList(){
    const idArray = [];

    return new Promise(resolve => {
        try {
            ReplyIOCampaignRecord.getCampaignList({},function(error,data){
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

/**
 * fetch campaign records from api and do a comparison with database campaign records
 * @returns {Promise<void>}
 */
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
       var connecationCount = 1;

       // mongoose.disconnect();
       const apiResponse = await ReplyIOController.callReplyIOAPI('campaigns','GET');
       const formattedResponse = JSON.parse(apiResponse);
       const updatedRecordIdList = [];

       for(let record of formattedResponse){
           connecationCount++;
           if(campaignIdList.includes(record.id)){

               //update record
               updatedRecordIdList.push(record.id);
               record.status = 'Active';
               ReplyIOCampaignRecord.findOneAndUpdate({id:record.id},{ $set: record},function (err,data) {
                   if(err){
                       console.log(err);
                   }
                   else {
                       console.log('Updated successfully');
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
               ReplyIOCampaignRecord.addCampaignRecord(newCampaignRecord,function (err,data) {

                   if(err){
                       console.log(err);
                   }
                   else {
                       console.log('Added successfully');
                   }
                   connecationCount--;
                   if(connecationCount==0){
                       mongoose.disconnect();
                   }
               });

           }
       }

       //Archive if not updated
        const archiveRecordIdList = diff(campaignIdList,updatedRecordIdList);
       if(archiveRecordIdList.length>0){
           ReplyIOCampaignRecord.update({id:{$in: archiveRecordIdList}}, { $set:
                   {
                       status: 'Archive' ,
                   }}, {"multi": true}, function (err,data) {

               if(err){
                   console.log(err);
               }
               else {
                   console.log('Archived Successfully');


               }
               connecationCount--;
               if(connecationCount==0){
                   mongoose.disconnect();
               }
           });
       }
       else {
           connecationCount--;
           if(connecationCount==0){
               mongoose.disconnect();
           }
       }



    }
    catch (e) {
        console.log(e);
    }
}



run();