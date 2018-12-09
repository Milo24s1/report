const ReplyIOController = {};
const request = require('request');
const replyIOCredintials = require('../../config/replyIOCredintials');
const API_BASE_PATH = 'https://api.reply.io/v1/';
const ReplyIOCampaignRecord = require('../../model/replyIOCampaignRecord');
const ReplyIOCompany = require('../../model/replyIOCompany');

ReplyIOController.getReplyIOCompanies = function(req,res){

    try {
        ReplyIOCompany.getCompanyList({},null,null,(error,data)=>{

            if(error){

            }
            else {
                res.render('replyIOcompanylist',{items:data});
            }

        });
    }
    catch (e) {
        console.log('catch ---->'+e);
        res.render('error',{error:''});
    }

};
ReplyIOController.getReplyIOCampaigns = function(req,res){
    try {
        ReplyIOCampaignRecord.getCampaignList({'status':'Active'},function (err,data) {

            if(err){
                res.status(500).send({err:err});
            }
            else {
                const companyNames = [];
                let responseData = {};

                for (let d of data){
                    console.log(d.name);
                    let companyName = d.name.split("-")[1];
                    if(companyName != undefined){

                        if(companyNames.includes(companyName)){

                            let existingRecords = responseData[companyName];
                            existingRecords.deliveriesCount += d.deliveriesCount;
                            existingRecords.opensCount += d.opensCount;
                            existingRecords.repliesCount += d.repliesCount;
                            existingRecords.bouncesCount += d.bouncesCount;
                            existingRecords.optOutsCount += d.optOutsCount;
                            existingRecords.outOfOfficeCount += d.outOfOfficeCount;
                            existingRecords.peopleCount += d.peopleCount;
                            existingRecords.peopleFinished += d.peopleFinished;
                            existingRecords.peopleActive += d.peopleActive;
                            existingRecords.peoplePaused += d.peoplePaused;

                            responseData[companyName]= existingRecords;
                        }
                        else {
                            companyNames.push(companyName);
                            responseData[companyName]= d;
                        }
                    }

                }
                console.log(responseData);
                res.status(200).send(responseData)
            }
        })
    }
    catch (e) {

    }
};

ReplyIOController.callReplyIOAPI = function(api,method){

  return new Promise(resolve => {
      const getOptions = {
          url:API_BASE_PATH+api,
          method: method,
          jar: true,
          followAllRedirects: true,
          headers: {
              'x-api-key':replyIOCredintials.apiKey
          }
      };

      try {
          request.get(getOptions,(error,response,html)=>{

              if(error){
                  console.log('request error');
                  console.log(error);
                  resolve(error);
              }
              else {
                  console.log('got result');
                  console.log(response.headers);
                  resolve(html);
              }
          });
      }
      catch (e) {
          console.log('catch error');
          console.log(e);
          resolve(e);
      }
  }) ;
};

async function test(){
    console.log('calling test funcion');
    const result = await ReplyIOController.callReplyIOAPI('campaigns','GET');
    console.log(result);
}
//test();
module.exports = ReplyIOController;