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
        url:'https://ulinc.co/login/',
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
                    url:'https://ulinc.co/login/',
                    method: 'POST',
                    form: {
                        'email':jetbuzzCredintials.jetbuzzUsername,
                        'password':jetbuzzCredintials.jetbuzzPassword,
                        'sign':1
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
                                    url: jetbuzzAccounts[k] + 'campaigns/?do=campaigns&act=campaigns',
                                    method: 'GET'
                                };

                                console.log(accountGetOption);

                                request.get(accountGetOption, (error, response, html) => {

                                    if (error) {
                                        console.log('account error' + error);
                                    }
                                    else {
                                        const isActiveOnly = false;
                                        const campaignsLinks = getCampaignLinks(html, isActiveOnly);
                                        for (let campaignLink of campaignsLinks) {

                                            const pageNumber = 1;
                                            getReplyForCampaign(campaignLink, pageNumber, k);
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
        getOptions.url = campaignLink+'?statusOrder=100&filter[0]=1';
    }
    else{
        getOptions.url = campaignLink+'?statusOrder=100&page='+pageNumber;
    }

    const jetbuzzCampaignId = campaignLink.split('campaigns/')[1].split("/")[0];

    request.get(getOptions,async (error,response,html)=>{

        if(error){
            console.log(error);
        }
        else {

            let {continueToNextPage,repliesInfo,contactIdList} = await extractCampaignRepliesFromList(jetbuzzCampaignId,html);
            repliesInfo = await  addExtraInformationForReplyEntities(repliesInfo,contactIdList,campaignLink);
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
    const contactIdList = [];

    return new Promise(resolve => {
        if(html!=undefined){
            const $ = cheerio.load(html);

            if($("#campaign_people tbody tr") !=undefined && $("#campaign_people tbody tr").length>0){
                $("#campaign_people tbody tr").each(function (index) {

                    //console.log($(this).attr('id'));
                    if($(this).find('td:nth-child(8)').text().trim() =='Replied' || $(this).find('td:nth-child(8)').text().trim() =='Talking'){
                        const singleReply = {};
                        singleReply.name = $(this).find('td:nth-child(2)').text();
                        singleReply.pCompany = $(this).find('td:nth-child(3)').text();
                        singleReply.title = $(this).find('td:nth-child(5)').text();
                        singleReply.uniqueId = jetbuzzCampaignId+'_'+$(this).attr('id');
                        repliesOnThisPage.push(singleReply);
                        contactIdList.push($(this).attr('id').split("_")[1]);
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

        resolve ({continueToNextPage:continueToNextPage,repliesInfo:repliesOnThisPage,contactIdList:contactIdList});
    });

}


function addExtraInformationForReplyEntities(repliesInfo,contactIdList,campaignLink) {

    return new Promise(resolve => {

        const csvPostOptions = {
            method: 'POST',
            jar: true,
            followAllRedirects: true,
            url:campaignLink+'?do=campaigns&act=export',
            form: {
                id: campaignLink.split("/")[5],
                ids: contactIdList.join(","),
                status: 3
            }

        };

        try {
            request.post(csvPostOptions,(error,response,html)=>{

                if(error){
                    resolve(repliesInfo);
                }
                else {
                    if(html!= undefined){

                        const csvLines = html.split("\n");
                        const sortedContactIdList = contactIdList.sort();

                        for (let i=0;i<repliesInfo.length;i++){
                            const contactId =repliesInfo[i].uniqueId.split("_")[2] ;
                            const index = sortedContactIdList.indexOf(contactId);
                            const matchingCsvLine = csvLines[index];
                            const csvArray = CSVtoArray(matchingCsvLine);
                            if(csvArray){
                                repliesInfo[i].phone = csvArray['6'];
                                repliesInfo[i].email = csvArray['5'];
                            }

                        }

                        resolve(repliesInfo);
                    }
                }

            });
        }
        catch (e) {
            console.log('catch'+e);
            resolve(repliesInfo)
        }

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
            console.log('Successfully Posted for :'+accountEmail);
        }
    });
}

function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};
