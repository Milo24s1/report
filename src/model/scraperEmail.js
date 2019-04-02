const ScraperEmailController = {};
const nodemailer = require('nodemailer');
const moment = require('moment');
const Scraper = require('../../model/scraper');
const csv = require('to-csv');
const EmailQueueController = require("../../src/model/emailQueueController");
const ScraperMailFactory  = require('../mail/scraperMailFactory');


ScraperEmailController.sendInstantEmail = function(req,res){

    try {
        ScraperEmailController.sendScraperEmail(req.body.scraperId,req.body.customSelection,req.body.emailAddressList,
            req.body.customMessage, req.body.customSubject, function (status,message) {

                res.status(status).send({message:message});
            });
    }
    catch (e) {
        res.status(500).send({e:e});
    }
};

ScraperEmailController.sendScraperEmail =  async function(scraperId,customSelection,customReceivers,customMessage,customSubject,callback){
    try {

        Scraper.findById(scraperId,function (err,scraper) {
            if(err){
                console.log(err);
                callback(500,err);
                EmailQueueController.addRecord('Web Scraper','ERROR',`cant find scraper with scraperId ${scraperId} ${err}`,'','',customReceivers);
            }
            else {
                if(scraper.senderEmail && scraper.senderPassword){

                    if(customSelection==null){
                        customSelection = scraper.emailColumns;
                    }
                    if(customReceivers==null){
                        customReceivers = scraper.sendTo;
                    }
                    if(customMessage==null){
                        customMessage= scraper.defaultMessage;
                    }


                    if(customSelection != undefined){

                        if(customReceivers != undefined && customReceivers.length>0){

                            //TODO discuss with client which records needs to be shown ( daily records)
                            const scraperMailer =  new ScraperMailFactory().getScraperMailer(scraper.scraperName);

                            scraperMailer.getDataSet({},async function (error,data) {
                                if(error){
                                    callback(500,error);
                                    EmailQueueController.addRecord('Web Scraper','ERROR',`No Campaign found  for report for scraper ${scraper.scraperName}`,scraper.scraperName,scraper.senderEmail,customReceivers);
                                }
                                else {

                                    let html = scraperMailer.getEmailBody(data,customSelection,customMessage,scraper.scraperName);
                                    // console.log('debug');
                                    // console.log(html);
                                    const transporter = nodemailer.createTransport({
                                        host: 'smtp.gmail.com',
                                        port: 465,
                                        secure: true, // true for 465, false for other ports
                                        auth: {
                                            user: scraper.senderEmail, // generated ethereal user
                                            pass: scraper.senderPassword // generated ethereal password
                                        }
                                    });

                                    let mailOptions = {
                                        from:  `<${scraper.senderEmail}>`, // sender address
                                        to: customReceivers.join(','), // list of receivers
                                        subject: customSubject? customSubject:`Daily Scraper Report Snapshot for ${scraper.scraperName} ${moment().format("YYYY-MM-DD")}`, // Subject line
                                        // text: 'Hello world?', // plain text body
                                        html: html // html body
                                    };


                                    let csvDataInput =  scraperMailer.getCSVcontent(data,customSelection);
                                    console.log('len is '+csvDataInput.length);
                                    if(csvDataInput.length){
                                        let csvData = csv(csvDataInput);
                                        mailOptions.attachments =  [{
                                            filename: `${scraper.scraperName}_${moment().format('YYYY-MM-DD')}.csv`,
                                            content: csvData
                                        }];
                                    }


                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            callback(500,error);
                                            EmailQueueController.addRecord('Web Scraper','ERROR',`Gmail error  for scraper ${scraper.scraperName} ${error}`,scraper.scraperName,scraper.senderEmail,customReceivers);
                                        }
                                        else {
                                            callback(200,`Message sent: ${info.messageId}`);
                                            EmailQueueController.addRecord('Web Scraper','SUCCESS',`Message sent: ${info.messageId} for scraper ${scraper.scraperName}`,scraper.scraperName,scraper.senderEmail,customReceivers);
                                        }

                                    });


                                }
                            });
                        }
                        else {
                            callback(400,'No Receivers setup for '+scraper.scraperName+' report, Please set up at lease one Receiver');
                            EmailQueueController.addRecord('Web Scraper','ERROR',`No Receivers setup for report for scraper ${scraper.scraperName}`,scraper.scraperName,scraper.senderEmail,customReceivers);
                        }
                    }
                    else {
                        callback(400,'No columns selected for '+scraper.scraperName+ ' report, Please select at lease one column');
                        EmailQueueController.addRecord('Web Scraper','ERROR',`No columns selected for report for scraper ${scraper.scraperName}`,scraper.scraperName,scraper.senderEmail,customReceivers);
                    }

                }
                else {
                    callback(400,'Sender Account username/password is not configured for '+scraper.scraperName);
                    EmailQueueController.addRecord('Web Scraper','ERROR',`Sender Account username/password is not configured for scraper ${scraper.scraperName}`,scraper.scraperName,'',customReceivers);
                }
            }
        });


    }
    catch (e) {
        callback(500,e);
        EmailQueueController.addRecord('Web Scraper','ERROR',`App crashed for scraper with scraperId ${scraperId} ${e}`,'','',customReceivers);
    }


};

module.exports = ScraperEmailController;