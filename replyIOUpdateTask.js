const ReplyIOController = require('./src/model/replyIO');
const ReplyIOCampaignRecord = require('./model/replyIOCampaignRecord');
const config = require('./config/credintials');
const replyIOCredintials = require('./config/replyIOCredintials');
const request = require('request');
const mainConfig = require('./config/mainConfig');
const DASHBOARD_URL = mainConfig.dashboardUrl;

/**
 * this is a helper function to post data to dashboard API
 * @param postOptions
 */
function postDataToDashAPI(postOptions) {
    try {
        postOptions.form.replyIOSecret = replyIOCredintials.replyIOSecret;
        request.post(postOptions,(error,response,html)=>{
            if(error){
                console.log('postDataToDashAPI error '+error);
            }
            else {
                console.log('postDataToDashAPI success');
            }
        });
    }
    catch (e) {
        console.log('postDataToDashAPI catch: '+e);
    }
}


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

        const getOptions = {
            jar: true,
            followAllRedirects: true,
            method: 'GET',
            url:DASHBOARD_URL+'/api/replyIOCampaigns',
        };

        try {
            request.get(getOptions,(error,response,html)=>{

                if(error){
                    console.log('request error getCampaignIdList: '+error);
                    resolve(idArray);
                }
                else {

                    try {
                        const jsonResponse = JSON.parse(html);
                        const data = jsonResponse.data;
                        for(let d of data){
                            idArray.push(d.id) ;
                        }
                        resolve(idArray);
                    }
                    catch (e) {
                        console.log("********* json error start********");
                        console.log(html);
                        console.log(e);
                        console.log("********* json error ends********");
                        resolve(idArray);
                    }

                }
            })
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


    try {

       const campaignIdList = await getCampaignIdList();
       console.log(campaignIdList);

       // mongoose.disconnect();
       const apiResponse = await ReplyIOController.callReplyIOAPI('campaigns','GET');
       const formattedResponse = JSON.parse(apiResponse);
       const updatedRecordIdList = [];

       for(let record of formattedResponse){
           if(campaignIdList.includes(record.id)){

               //update record
               updatedRecordIdList.push(record.id);
               record.status = 'Active';
               const updatePostOptions = {
                   jar: true,
                   followAllRedirects: true,
                   method: 'GET',
                   url:DASHBOARD_URL+'/api/updateReplyIOCampaign',
                   form:{
                       record:record
                   }
               };
               postDataToDashAPI(updatePostOptions);

           }
           else {
               //insert record
               const newCampaignRecord = new ReplyIOCampaignRecord(record);
               newCampaignRecord.status = 'Active';
               const addPostOptions = {
                   jar: true,
                   followAllRedirects: true,
                   method: 'GET',
                   url:DASHBOARD_URL+'/api/addReplyIOCampaign',
                   form:{
                       newCampaignRecord:newCampaignRecord
                   }
               };
               postDataToDashAPI(addPostOptions);

           }
       }

       //Archive if not updated
        const archiveRecordIdList = diff(campaignIdList,updatedRecordIdList);
       if(archiveRecordIdList.length>0){

           const archivePostOption = {
               jar: true,
               followAllRedirects: true,
               method: 'GET',
               url:DASHBOARD_URL+'/api/archiveReplyIOCampaign',
               form:{
                   archiveRecordIdList:archiveRecordIdList
               }
           };
           postDataToDashAPI(archivePostOption);
       }




    }
    catch (e) {
        console.log(e);
    }
}



run();