const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');
const jetbuzzCredintials = require('./config/jetbuzzCredintials');
const DASHBOARD_API = `http://dash.prospectgenai.com/api/jetbuzzReplies`;
// const DASHBOARD_API = `http://localhost:9999/api/jetbuzzReplies`;

run();
function run() {
    const getOption = {
        jar: true,
        followAllRedirects: true,
        url:'https://jetbuzz.io/login/',
        method: 'GET'
    };

    try {

        request.get(getOption,(error,response,html)=>{

            if(error){
                console.log(error);
            }
            else {

                const postOption = {
                    jar: true,
                    followAllRedirects: true,
                    url:'https://jetbuzz.io/login/',
                    method: 'POST',
                    form: {
                        'email':jetbuzzCredintials.jetbuzzUsername,
                        'password':jetbuzzCredintials.jetbuzzPassword,
                        'sign':'Log+in'
                    }
                };

                request.post(postOption,(error,response,html)=>{
                    if(error){
                        console.log('login error'+error);
                    }
                    else {
                        console.log('logged in to account');
                        const jetbuzzAccounts = getAccounts(html);
                        for (let k in jetbuzzAccounts){


                                const accountGetOption = {
                                    jar: true,
                                    followAllRedirects: true,
                                    url:jetbuzzAccounts[k]+'campaigns/?do=campaigns&act=campaigns',
                                    method: 'GET'
                                };

                                console.log(accountGetOption);

                                request.get(accountGetOption,(error,response,html)=>{

                                    if(error){
                                        console.log('account error'+error);
                                    }
                                    else {
                                        const isActiveOnly = true;
                                        const campaignsLinks = getCampaignLinks(html,isActiveOnly);
                                        for(let campaignLink of campaignsLinks){

                                            const pageNumber = 1;
                                            getReplyForCampaign(campaignLink,pageNumber,k);
                                        }
                                    }
                                });



                        }
                    }
                });
            }
        });
    }
    catch (e) {
        console.log(e);
    }
}


function getAccounts(html){
    const accounts = [];

    if(html !=undefined){
        const $ = cheerio.load(html);
        $(".box-body tr td:first-child a").each(function (index) {
            accounts[$(this).text()]=$(this).attr("href");
        });
    }
    return accounts;
}

function getCampaignLinks(html,isActiveOnly) {

    const campaignLinks = [];
    if(html != undefined){

        const $ = cheerio.load(html);
        $("table tbody tr").each(function () {
           const campaignStatus = $(this).find('td:nth-child(2)').text().trim();
           const campaignLink = $(this).find('a').attr('href');

           if(isActiveOnly){
                if(campaignStatus=='Active'){
                    campaignLinks.push(campaignLink);
                }
           }
           else {
               campaignLinks.push(campaignLink);
           }

        });
    }

    return campaignLinks;
}

function getReplyForCampaign(campaignLink,pageNumber,accountEmail) {

    const getOptions = {
        jar: true,
        followAllRedirects: true,
        method: 'GET'
    };

    if(pageNumber==1){
        getOptions.url = campaignLink+'?statusOrder=10&filter[0]=1';
    }
    else{
        getOptions.url = campaignLink+'?statusOrder=10&page='+pageNumber;
    }

    const jetbuzzCampaignId = campaignLink.split('campaigns/')[1].split("/")[0];

    request.get(getOptions,async (error,response,html)=>{

        if(error){
            console.log(error);
        }
        else {

            const {continueToNextPage,repliesInfo} = await extractCampaignRepliesFromList(jetbuzzCampaignId,html);
            console.log(continueToNextPage);
            if(repliesInfo.length>0){
                postDataToDashboard(repliesInfo,accountEmail);
            }
            if(continueToNextPage){
                pageNumber++;
                getReplyForCampaign(campaignLink,pageNumber,accountEmail);
            }

        }
    });

}


function extractCampaignRepliesFromList(jetbuzzCampaignId,html) {

    let continueToNextPage = true;
    const repliesOnThisPage = [];

    return new Promise(resolve => {
        if(html!=undefined){
            const $ = cheerio.load(html);

            if($("#campaign_people tbody tr") !=undefined && $("#campaign_people tbody tr").length>0){
                $("#campaign_people tbody tr").each(function (index) {

                    //console.log($(this).attr('id'));
                    if($(this).find('td:nth-child(8)').text().trim() =='Replied'){
                        const singleReply = {};
                        singleReply.name = $(this).find('td:nth-child(2)').text();
                        singleReply.pCompany = $(this).find('td:nth-child(3)').text();
                        singleReply.title = $(this).find('td:nth-child(5)').text();
                        singleReply.uniqueId = jetbuzzCampaignId+'_'+$(this).attr('id');
                        repliesOnThisPage.push(singleReply);
                    }
                    else {
                        continueToNextPage = false;
                    }


                });
            }

            else {
                continueToNextPage = false;
            }

        }

        resolve ({continueToNextPage:continueToNextPage,repliesInfo:repliesOnThisPage});
    });

}


function postDataToDashboard(replies,accountEmail) {

    const repliesPostOptions = {
        jar: true,
        followAllRedirects: false,
        url:DASHBOARD_API,
        method: 'POST',
        form: {
            replies:replies,
            accountEmail:accountEmail,
            jetbuzzSecret : jetbuzzCredintials.jetbuzzSecret
        },
    };

    request.post(repliesPostOptions,(error,response,html)=>{

        if(error){
            console.log(error);
        }
        else {
            // console.log(html);
            console.log('Successfully Posted');
        }
    });
}
