const moment = require('moment');
const EmailQueue = require('../../model/emailQueue');
const EmailQueueController = {};

EmailQueueController.addRecord = function(type,status,message,company,senderEmail,receivers){

    const emailQueueRecord = new EmailQueue(
        {
            type: type,
            status: status,
            message: message,
            loggedDate: moment(),
            company:company,
            senderEmail:senderEmail,
            receivers:receivers!= undefined ?receivers.join(", ") :''
        }
    );

    try {
        EmailQueue.addEmailRecord(emailQueueRecord,function (err,data) {
            if(err){
                console.log('db error in saving emailQueueRecord');
                console.log(e);
            }
            else {
                console.log('email record save successfully');
            }

        });
    }
    catch (e) {
        console.log('catch error in saving emailQueueRecord');
        console.log(e);
    }
};

EmailQueueController.getEmailQueueRecordList = function(req,res){
    try {
        const perPage = 20;
        const options= {
            sort: req.body.sortParams,
            skip: perPage*Number(req.body.pageNumber),
            limit: perPage
        };

        EmailQueue.getEmailQueueList({},null,options,function (err,data) {
            if(err){
                console.log(err);
                res.status(500).send({err:err});
            }
            else {
                res.status(200).send({list:data});
            }
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).send({e:e});
    }
};

EmailQueueController.deleteEmailQueueRecords = function(req,res){
    try {
        //Ignored checking Secretkey since there is no chance API to be called from 3rd party
        const fromDate = req.body.fromDate != undefined ? moment(req.body.fromDate): moment();
        EmailQueue.removeRecords({loggedDate:{$lte: fromDate}},function (err,data) {
            if(err){
                console.log(e);
                res.status(500).send({err:e});
            }
            else {
                res.status(200).send({msg:"Successfully Deleted"});
            }
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).send({"err":e});
    }
};


module.exports = EmailQueueController;