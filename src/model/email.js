const EmailController = {};
const nodemailer = require('nodemailer');
const moment = require('moment');
const csv = require('to-csv');
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');
const People = require('../../model/people');
const REPLIES_SHOWN_IN_EMAIL = 12;
const ADD_ATTACHMENT_ALWAYS = true;
const DATA_PULLING_DAY = 2;
const EmailQueueController = require("../../src/model/emailQueueController");
const jetbuzzConfig = require('../../config/jetbuzzCredintials');


EmailController.sendInstantEmail = function(req,res){

    try {
        EmailController.sendCompanyEmail(req.body.companyId,req.body.customSelection,req.body.emailAddressList,
            req.body.customMessage, req.body.customSubject,function (status,message) {

            res.status(status).send({message:message});
        });
    }
    catch (e) {
        res.status(500).send({e:e});
    }
};

EmailController.sendJetbuzzEmail = function(req,res){
  try {
      if(req.body.jetbuzzSecret == jetbuzzConfig.jetbuzzSecret){
          EmailController.sendCompanyEmail(req.body.companyId,null,null,null,null,function (status,message) {
              console.log(status+':'+message);
              res.send(status+':'+message)
          });
      }
      else {
          res.send('Unautorized');
      }
  }
  catch (e) {
      res.send('Catch Error'+e);
  }
};

EmailController.sendCompanyEmail =  async function(companyId,customSelection,customReceivers,customMessage,customSubject,callback){
    try {

        Company.getItemById(companyId,function (err,company) {
            if(err){
                console.log(err);
                callback(500,err);
                EmailQueueController.addRecord('Linkedin','ERROR',`cant find company with companyID ${companyId}`,'','',customReceivers);
            }
            else {
                if(company.senderEmail && company.senderPassword){

                    if(customSelection==null){
                        customSelection = company.emailColumns;
                    }
                    if(customReceivers==null){
                        customReceivers = company.sendTo;
                    }
                    if(customMessage==null){
                        customMessage= company.defaultMessage;
                    }


                    if(customSelection != undefined){

                        if(customReceivers != undefined){

                            CampaignRecord.getCampaignRecordsByCompanyId(companyId,async function (err,data) {
                               if(err){
                                   callback(500,err);
                                   EmailQueueController.addRecord('Linkedin','ERROR',`No Campaign found  for report for company ${company.companyName}`,company.companyName,company.senderEmail,customReceivers);

                               }
                               else {
                                   let html = EmailController.getEmailBody(data,customSelection,customMessage);
                                   let {replyHtml,isAttachmentAvailable,csvDataInput} =  await EmailController.getReplyContent(companyId);



                                   const transporter = nodemailer.createTransport({
                                       host: 'smtp.gmail.com',
                                       port: 465,
                                       secure: true, // true for 465, false for other ports
                                       auth: {
                                           user: company.senderEmail, // generated ethereal user
                                           pass: company.senderPassword // generated ethereal password
                                       }
                                   });

                                   let mailOptions = {
                                       from:  `<${company.senderEmail}>`, // sender address
                                       to: customReceivers.join(','), // list of receivers
                                       subject: customSubject?customSubject:`ProspectGen AI: ${company.companyName} Weekly Report Snapshot ${moment().format("YYYY-MM-DD")}`, // Subject line
                                       // text: 'Hello world?', // plain text body
                                       html: html+replyHtml // html body
                                   };




                                   //let isAttachmentAvailable = true;
                                   if(isAttachmentAvailable){
                                       let csvData = csv(csvDataInput);
                                       mailOptions.attachments =  [{
                                           filename: `${company.companyName}_replies.csv`,
                                           content: csvData
                                       }]
                                   }

                                   transporter.sendMail(mailOptions, (error, info) => {
                                       if (error) {
                                           callback(500,error);
                                           EmailQueueController.addRecord('Linkedin','ERROR',`Gmail error  for company ${company.companyName} ${error}`,company.companyName,company.senderEmail,customReceivers);

                                       }
                                       else {
                                           callback(200,`Message sent: ${info.messageId}`);
                                           EmailQueueController.addRecord('Linkedin','SUCCESS',`Message sent: ${info.messageId} for company ${company.companyName}`,company.companyName,company.senderEmail,customReceivers);

                                       }

                                   });


                               }
                            });
                        }
                        else {
                            callback(400,'No Receivers setup for report, Please set up at lease one Receiver');
                            EmailQueueController.addRecord('Linkedin','ERROR',`No Receivers setup for report for company ${company.companyName}`,company.companyName,company.senderEmail,customReceivers);
                        }
                    }
                    else {
                        callback(400,'No columns selected for report, Please select at lease one column');
                        EmailQueueController.addRecord('Linkedin','ERROR',`No columns selected for report for company ${company.companyName}`,company.companyName,company.senderEmail,customReceivers);
                    }

                }
                else {
                    callback(400,'Sender Account username/password is not configured');
                    EmailQueueController.addRecord('Linkedin','ERROR',`Sender Account username/password is not configured for company ${company.companyName}`,company.companyName,'',customReceivers);
                }
            }
        });


    }
    catch (e) {
        callback(500,e);
    }


};

EmailController.getEmailBody = function(rowData,customSelection,customMessage){
    let header = `<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" >

        <tr>
            <td align="left">
                <table border="0" align="left" width="590" cellpadding="0" cellspacing="0" class="container590">

                    <tr>
                        <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td align="left">

                            <table border="0" align="left" width="590" cellpadding="0" cellspacing="0" class="container590">

                        <td align="left">

                            <table border="0" align="left" width="590" cellpadding="0" cellspacing="0" class="container590">

                                <tr>
                                    <td align="left" style='padding-top: 10px;font-family: "Poppins", sans-serif;
line-height: 1.5;'>
                                       ${customMessage != undefined ? customMessage : ''}
                                       </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>`;

    if(rowData.length==0){
        const noresult = `<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" >

        <tr>
            <td align="center">
                <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                    <tr>
                        <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td align="center">

                            <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                                <tr>
                                    <td style='font-family: "Poppins", sans-serif;line-height: 1.5;font-weight: bolder;font-size: 34px;'>Sorry No Result Found</td>
                                </tr>
                                </table></td></tr></table></td></tr></table>`;
        return header+noresult;
    }
    let html= `<table style='background-color: rgba(0, 0, 0, 0);
border-collapse: collapse;
box-sizing: border-box;
color: rgb(33, 37, 41);
font-family: "Poppins", sans-serif;
font-size: 16px;
font-weight: 300;
line-height: 24px;
margin-bottom: 16px;
text-align: center;
min-width: 880px;
overflow-x: auto;'>
                    <thead style=';
border-collapse: collapse;
background-color: rgb(2, 8, 67);
box-sizing: border-box;
color: rgb(255, 255, 255);
font-family: "Poppins", sans-serif;
font-size: 12px;
font-weight: 300;
line-height: 24px;
text-align: left;
height: 65px;'>
                        <tr>
                            ${customSelection.indexOf('1')>-1?'<th style="padding-left: 0.75rem;" scope="col">Company</th>':''}
                            ${customSelection.indexOf('2')>-1?'<th scope="col">Campaign</th>':''}
                            ${customSelection.indexOf('3')>-1?'<th scope="col">Status</th>':''}
                            ${customSelection.indexOf('4')>-1?'<th scope="col">Email Prospects</th>':''}
                            ${customSelection.indexOf('5')>-1?'<th scope="col">Email Delivered</th>':''}
                            ${customSelection.indexOf('6')>-1?'<th scope="col">Email Opened</th>':''}
                            ${customSelection.indexOf('7')>-1?'<th scope="col">Email Responses</th>':''}
                            ${customSelection.indexOf('8')>-1?'<th scope="col" style="text-align: center;">Connection Requests</th>':''}
                            ${customSelection.indexOf('9')>-1?'<th scope="col" style="text-align: center;">New Connections</th>':''}
                            ${customSelection.indexOf('11')>-1?'<th scope="col" style="text-align: center;">Welcome Responses</th>':''}
                            ${customSelection.indexOf('10')>-1?'<th scope="col" style="text-align: center;">Message Responses</th>':''}
                            
                        </tr>
                    </thead>
                    <tbody style='border-collapse: collapse;
box-sizing: border-box;
color: rgb(33, 37, 41);
font-family: "Poppins", sans-serif;
font-size: 16px;
font-weight: 300;
line-height: 24px;
text-align: left;
'>`;

    for(i=0;i<rowData.length;i++){


        html += `<tr>
                            ${customSelection.indexOf('1')>-1?`<th style='font-size: 14px;width: 15%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        padding-left: 0.75rem;
        vertical-align: bottom;'scope="row">${rowData[i].companyName}</th>`:''}
                            ${customSelection.indexOf('2')>-1?`<td style='font-size: 14px;width: 15%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].campaignName}</td>`:''}
                            ${customSelection.indexOf('3')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].status}</td>`:''}
                            ${customSelection.indexOf('4')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].prospects}</td>`:''}
                            ${customSelection.indexOf('5')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].delivered} (${rowData[i].deliveredPercentage}%)</td>`:''}
                            ${customSelection.indexOf('6')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].opened} (${rowData[i].openedPercentage}%)</td>`:''}
                            ${customSelection.indexOf('7')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: left;
        vertical-align: bottom;'>${rowData[i].response} (${rowData[i].responsesPercentage}%)</td>`:''}
                            ${customSelection.indexOf('8')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: center;
        vertical-align: bottom;'>${rowData[i].customCol1}</td>`:''}
                            ${customSelection.indexOf('9')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: center;
        vertical-align: bottom;'>${rowData[i].customCol2} </td>`:''}
                            ${customSelection.indexOf('11')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: center;
        vertical-align: bottom;'>${rowData[i].customCol4} </td>`:''}
                            ${customSelection.indexOf('10')>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-collapse: collapse;
        border-top-color: rgb(255, 255, 255);
        border-top-style: none;
        border-top-width: 0px;
        box-sizing: border-box;
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        line-height: 21.6px;
        padding-bottom: 16px;
        padding-top: 17.6px;
        text-align: center;
        vertical-align: bottom;'>${rowData[i].customCol3} </td>`:''}
                                        
                                        
                                        
                                        
                                        
                                        
                                        
                                        </tr>`;
    }

    html += `</tbody></table>`;


    return header+html;
};

EmailController.getReplyContent = function(companyId){

    let replyContent = ``;
    let formattedCsvDataInput = [];
    let fromDate = getFromDate();
    let isAttachmentAvailable = false;


    return new Promise(resolve=>{
        try {
            People.getPeopleList({companyId:companyId,addedDate:{$gte: fromDate}},{ name: 1, pCompany: 1, title:1,companyId:1,phone:1,email:1,_id: 0 },null,function (err,data) {
                if(err){
                    console.log(err);
                    resolve({replyHtml:replyContent,isAttachmentAvailable:false,csvDataInput:formattedCsvDataInput});
                }
                else {

                    const numOfSearchResult = data.length;
                    if(numOfSearchResult>0){
                        isAttachmentAvailable = true;
                        // if(numOfSearchResult>REPLIES_SHOWN_IN_EMAIL){
                        //     isAttachmentAvailable = true;
                        // }
                        // else {
                        //     if(ADD_ATTACHMENT_ALWAYS == true){
                        //         isAttachmentAvailable = true;
                        //     }
                        //     isAttachmentAvailable = false;
                        // }

                        //add data to up to max level
                        let i=0;
                        let tableRows = ``;
                        while (i< REPLIES_SHOWN_IN_EMAIL && i <numOfSearchResult){

                            tableRows += `
                            <tr style="text-align: center;height: 100px;">
                                <td style="width: 25%"> `;

                            if(i<numOfSearchResult){
                                tableRows += `<div>
                                <div class="font-weight-bold" style="color: black;font-weight: bold;">${data[i].name}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: gray;">${data[i].pCompany}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: #150505;">${data[i].title}</div>
                            </div>`;

                                formattedCsvDataInput.push({'Name':data[i].name,'Company':data[i].pCompany,'Title':data[i].title,'Email':data[i].email,'Phone':data[i].phone});
                            }

                            tableRows +=`</td><td style="width: 25%">`;

                            if(i+1 <numOfSearchResult){
                                tableRows += `<div>
                                <div class="font-weight-bold" style="color: black;font-weight: bold;">${data[i+1].name}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: gray;">${data[i+1].pCompany}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: #150505;">${data[i+1].title}</div>
                            </div>`;
                                formattedCsvDataInput.push({'Name':data[i+1].name,'Company':data[i+1].pCompany,'Title':data[i+1].title,'Email':data[i+1].email,'Phone':data[i+1].phone});
                            }


                            tableRows +=`</td><td style="width: 25%">`;

                            if(i+2 <numOfSearchResult){
                                tableRows += `<div>
                                <div class="font-weight-bold" style="color: black;font-weight: bold;">${data[i+2].name}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: gray;">${data[i+2].pCompany}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: #150505;">${data[i+2].title}</div>
                            </div>`;
                                formattedCsvDataInput.push({'Name':data[i+2].name,'Company':data[i+2].pCompany,'Title':data[i+2].title,'Email':data[i+2].email,'Phone':data[i+2].phone});
                            }

                            tableRows +=`</td><td style="width: 25%">`;

                            if(i+3 <numOfSearchResult){
                                tableRows += `<div>
                                <div class="font-weight-bold" style="color: black;font-weight: bold;"">${data[i+3].name}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: gray;">${data[i+3].pCompany}</div>
                                <div class=" font-weight-bold" style="font-size: 13px;color: #150505;">${data[i+3].title}</div>
                            </div>`;
                                formattedCsvDataInput.push({'Name':data[i+3].name,'Company':data[i+3].pCompany,'Title':data[i+3].title,'Email':data[i+3].email,'Phone':data[i+3].phone});
                            }


                            tableRows += `</td></tr>`;

                            i=i+4;
                        }


                        if(isAttachmentAvailable && (numOfSearchResult > REPLIES_SHOWN_IN_EMAIL)){
                            tableRows += `<tr style="height: 200px;">
                                        <td style="width: 25%"></td>
                                        <td colspan="2" align="center" ><h2 style='font-family: "Poppins", sans-serif;
                                        text-align: center;font-size: 15px'> ${numOfSearchResult-REPLIES_SHOWN_IN_EMAIL} more ${numOfSearchResult-REPLIES_SHOWN_IN_EMAIL>1?'replies':'reply'} - see csv for all responses </h2>
                                        </td>
                                        <td style="width: 25%"></td></tr>`;


                            for (let i= REPLIES_SHOWN_IN_EMAIL;i<numOfSearchResult;i++){
                                formattedCsvDataInput.push({'Name':data[i].name,'Company':data[i].pCompany,'Title':data[i].title,'Email':data[i].email,'Phone':data[i].phone});
                            }
                        }

                        replyContent = EmailController.concatReplySections(tableRows);
                        resolve( {replyHtml:replyContent,isAttachmentAvailable: isAttachmentAvailable, csvDataInput:formattedCsvDataInput});
                    }
                    else {
                        resolve ({replyHtml:replyContent,isAttachmentAvailable:false,csvDataInput:formattedCsvDataInput});
                    }

                }

            });
        }
        catch (e) {
            console.log(e);
            resolve({replyHtml:replyContent,isAttachmentAvailable:false,csvDataInput:formattedCsvDataInput});
        }
    });











};

EmailController.concatReplySections = function(trCollection){

    let header = `<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" style='font-family: "Poppins", sans-serif;
font-size: 18px;
font-weight: 300;
line-height: 44px;
color: white;'>

<thead style="background-color: rgb(2, 8, 67);
font-size: 14px;
font-weight: 300;
line-height: 24px;
;

height: 65px">
<th>this week’s responses</th>
</thead>

</table>`;


    let body = `
    <table cellpadding="0" cellspacing="0" style='width: 100%;font-family: "Poppins", sans-serif;min-width: 880px;'>
        <tbody style="">
            ${trCollection}
        </tbody>
    </table>
    
    `;

    return header+body;
};

function getFromDate(){
    let systemDate = moment().format("YYYY-MM-DD");
    let currentDay = moment(systemDate).isoWeekday();

    let subs = 0;
    if(currentDay<=DATA_PULLING_DAY){
        subs = 6;
    }
    else if(currentDay>DATA_PULLING_DAY){
        subs = currentDay - DATA_PULLING_DAY;
    }
    return moment(systemDate).subtract(subs, 'days');
}
module.exports = EmailController;