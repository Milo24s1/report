const AngleController = {};
const request = require('request');
const moment = require('moment');
const mainConfig = require('../../config/mainConfig');
const AngleCompany = require('../../model/angleCompany');

AngleController.getCompanies = function(req,res){

    try {
        const perPage = 20;
        const options= {
            sort: req.body.sortParams?req.body.sortParams:{id:1},
            skip: perPage*Number(req.body.pageNumber),
            limit: perPage
        };
        const today = moment().startOf('day');
        const query= {addedDate:{$gte: today,
                $lte: moment(today).endOf('day')}};

        AngleCompany.getCompanyList(query,req.body.selector,options,(error,data)=>{

            if(error){
                res.status(500).send({error:error})
            }
            else {
                res.send({items:data});
            }

        });
    }
    catch (e) {
        console.log('catch ---->'+e);
        res.status(500).send({e:e})
    }

};
AngleController.getReplyIOCampaigns = function(req,res){
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



AngleController.saveCompanyRecordsViaCron = function(req,res){
    try {
        if(req.body.angleSecret == mainConfig.angleSecret){
            const companies =req.body.companies.map(o=>{
                o.month = new Date().getMonth(),
                o.year = new Date().getFullYear(),
                o.addedDate = moment();
                return o;
            });


            AngleCompany.addCompanyRecords(companies,(err,data)=>{
                if(err){
                    console.log(err);
                    res.status(200).send({msg:err});
                }
                else {
                    res.status(200).send({msg:data});
                }
            });

        }
        else {
            res.status(400).send({'error':'Bad request'});
        }

    }
    catch (e) {
        console.log(e);
        res.status(500).send({err:e});
    }
};


AngleController.deleteAngleCompany = function(req,res){

    try {
        const fromDate = req.body.fromDate != undefined ? moment(req.body.fromDate): moment();
        AngleCompany.removeRecords({addedDate:{$lte: fromDate}},function (err,data) {
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

module.exports = AngleController;