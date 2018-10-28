const EmailController = {};
const nodemailer = require('nodemailer');
const moment = require('moment');
const fs = require('fs');
const Company = require('../../model/company');
const CampaignRecord = require('../../model/campaignRecord');

EmailController.sendInstantEmail = function(req,res){

    try {
        EmailController.sendCompanyEmail(req.body.companyId,req.body.customSelection,req.body.emailAddressList,
            req.body.customMessage, function (status,message) {

            res.status(status).send({message:message});
        });
    }
    catch (e) {
        res.status(500).send({e:e});
    }
};

EmailController.sendCompanyEmail = function(companyId,customSelection,customReceivers,customMessage,callback){
    try {

        Company.getItemById(companyId,function (err,company) {
            if(err){
                console.log(err);
                callback(500,err);
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

                            CampaignRecord.getCampaignRecordsByCompanyId(companyId,function (err,data) {
                               if(err){
                                   callback(500,err);
                               }
                               else {
                                   const html = EmailController.getEmailBody(data,customSelection,customMessage);


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
                                       subject: `ProspectGen AI: ${company.companyName} Weekly Report Snapshot ${moment().format("YYYY-MM-DD")}`, // Subject line
                                       // text: 'Hello world?', // plain text body
                                       html: html // html body
                                   };

                                   transporter.sendMail(mailOptions, (error, info) => {
                                       if (error) {
                                           callback(500,error);
                                       }
                                       callback(200,`Message sent: ${info.messageId}`);
                                   });


                               }
                            });
                        }
                        else {
                            callback(400,'No Receivers setup for report, Please set up at lease one Receiver');
                        }
                    }
                    else {
                        callback(400,'No columns selected for report, Please select at lease one column');
                    }

                }
                else {
                    callback(400,'Sender Account username/password is not configured');
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
            <td align="center">
                <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                    <tr>
                        <td height="25" style="font-size: 25px; line-height: 25px;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td align="center">

                            <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

                        <td align="center">

                            <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">

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
width: 1600px;
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
                            ${customSelection.indexOf('4')>-1?'<th scope="col">Prospects</th>':''}
                            ${customSelection.indexOf('5')>-1?'<th scope="col">Email Delivered</th>':''}
                            ${customSelection.indexOf('6')>-1?'<th scope="col">Opened</th>':''}
                            ${customSelection.indexOf('7')>-1?'<th scope="col">Responses</th>':''}
                            ${customSelection.indexOf('8')>-1?'<th scope="col">Connection Requests</th>':''}
                            ${customSelection.indexOf('9')>-1?'<th scope="col">New Connections</th>':''}
                            ${customSelection.indexOf('10')>-1?'<th scope="col">Message Responses</th>':''}
                            
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
                            ${customSelection.indexOf('1')>-1?`<th style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('2')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('3')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('4')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('5')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('6')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('7')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
                            ${customSelection.indexOf('8')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].customCol1}</td>`:''}
                            ${customSelection.indexOf('9')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].customCol2} </td>`:''}
                            ${customSelection.indexOf('10')>-1?`<td style='font-size: 12px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].customCol3} </td>`:''}
                                        
                                        
                                        
                                        
                                        
                                        
                                        
                                        </tr>`;
    }

    html += `</tbody></table>`;


    return header+html;
}
module.exports = EmailController;