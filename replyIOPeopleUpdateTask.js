const replyIOConfig = require('./config/replyIOConfig');
const replyIOCredintials = require('./config/replyIOCredintials');
const config = require('./config/credintials');
const userConfig = require('./config/userConfig');
const ReplyIOController = require('./src/model/replyIO');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const DASHBOARD_API = `${userConfig.systemHost}api/replyIOReplies`;


run();
async function run() {
    const apiResponse = await ReplyIOController.callReplyIOAPI('campaigns','GET');
    const formattedResponse = JSON.parse(apiResponse);
    processCampaignList(formattedResponse);

}

function processCampaignList(campaignList){
    const getLoginOptions = {
        jar: true,
        followAllRedirects: true,
        url: 'https://run.reply.io/'
    };

    const postLoginOptions = {
        jar: true,
        followAllRedirects: true,
        url: 'https://run.reply.io/login',
        form: {
            Email:replyIOCredintials.email,
            Password:replyIOCredintials.password,
        }
    };

    const postCampaignRepliesOptions = {
        jar: true,
        followAllRedirects: true,
        url: 'https://run.reply.io/CampaignProspect/MGetCampaignProspects',
        form: {
            campaignId:207124,
            campaignStepId:null,
            columns	: ['name','email','status','sent','opens','views','replies','nextStepNum'],

            filterId:-3,
            pageNum:2,
            rules	 :[{"property":"replied","condition":"oneOrMore","value":"0"}],
            searchTerm:'',
            sortDirection:'desc',
            sortField:'addedOn'
        },
        headers:{
            'Host': 'run.reply.io',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://run.reply.io/dashboard/material',
            'X-XSRF-Token': '',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json;charset=utf-8',
            'Request-Context': 'appId=cid-v1:85ea9af9-16cb-4743-bc16-3fb0a482deea',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        },
        gzip: true
    };

    request.get(getLoginOptions,(error,response,html)=>{

        if(error){
            console.log('### Loading login page error');
            console.log(error);
        }
        else {
            console.log('Login Page Loaded, posting login data');
            request.post(postLoginOptions,async (error,response,html)=>{

                if(error){
                    console.log('### Posting login page data error');
                    console.log(error);
                }
                else {

                    console.log('Home page loaded' +isHomepage(html));
                    // if(isHomepage==false)
                    //     return;

                    //check each campaign
                    for (let campaign of campaignList){



                        try {
                            console.log('start processing '+campaign.name);
                            const replyResponse = await getCampaignReplies(campaign.id);
                            break;
                        }
                        catch (e) {
                            console.log(e);
                        }



                    }



                }
            });
        }
    });
}





function isHomepage(html) {
    const  $ =cheerio.load(html);
    if($("#main-wrap") != undefined && $("#main-wrap").length==1){
        return true;
    }
    return false;
}

function getTokenFromCamppage(html) {
    const  $ =cheerio.load(html);
    const token = $('input[name ="__RequestVerificationToken"]').val();
    console.log('token is '+token);
    return token;

}


function getCampaignReplies(campaignId) {

    const getCampaignOptions = {
        jar:true,
        followAllRedirects:true,
        url: `https://run.reply.io/dashboard/material#/campaign/${campaignId}/people`
    };
    const postCampaignRepliesOptions = {
        jar: true,
        followAllRedirects: true,
        url: 'https://run.reply.io/CampaignProspect/MGetCampaignProspects',
        form: {
            campaignId:campaignId,
            campaignStepId:null,
            columns	: ['name','email','status','sent','opens','views','replies','nextStepNum'],

            filterId:-3,
            pageNum:1,
            rules	 :[{"property":"replied","condition":"oneOrMore","value":"0"}],
            searchTerm:'',
            sortDirection:'desc',
            sortField:'addedOn'
        },
        headers:{
            'Host': 'run.reply.io',
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://run.reply.io/dashboard/material',
            'X-XSRF-Token': '',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json;charset=utf-8',
            'Request-Context': 'appId=cid-v1:85ea9af9-16cb-4743-bc16-3fb0a482deea',
            'Connection': 'keep-alive',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        },
        gzip: true
    };

    return new Promise(resolve => {
        request.get(getCampaignOptions,(error,response,html)=>{
            if(error){
                console.log('campaign loading error');
                resolve();
            }
            else {
                const token = getTokenFromCamppage(html);
                postCampaignRepliesOptions.headers['X-XSRF-Token'] = token;


                request.post(postCampaignRepliesOptions,async (error,response,html)=>{

                    if(error){
                        console.log('### Fetching replies error');
                        console.log(error);
                        resolve()
                    }
                    else {
                        const formattedResponse = JSON.parse(html);

                        console.log('posting data from page '+formattedResponse.pageNum+' to API');
                        postDataToDashboard(filterPostFields(formattedResponse.prospects));

                        const pagesCount = formattedResponse.pagesCount;
                        for (let i=2;i<=pagesCount;i++){
                            console.log('Start fetching data from page '+i);
                            await navigatePages(i,postCampaignRepliesOptions)
                        }

                        resolve(true);


                    }
                });
            }
        });
    });
}

function navigatePages(currentPage,postOptions) {

    postOptions.form.pageNum =currentPage;
    return new Promise(resolve => {
        request.post(postOptions,(error,response,html)=>{

            if(error){
                console.log('### Fetching replies error in page '+currentPage);
                console.log(error);
                resolve(false);
            }
            else {
                const formattedResponse = JSON.parse(html);
                console.log('posting data from page '+formattedResponse.pageNum+' to API');
                postDataToDashboard(filterPostFields(formattedResponse.prospects));
                resolve(true);


            }
        });
    });
}

const dummy = [
    {
        id : 1000,
        email:"emp1000@gmail.com",
        name:"emp1000 emp1000",
        title: "title 1000",
        company: "company 1000",
        campaignId: '206827',
        lastReplyDate: '2018-11-12T14:14:03+00:00'
    },
    {
        id : 1001,
        email:"emp1001@gmail.com",
        name:"emp1001 emp1001",
        title: "title 1001",
        company: "company 1001",
        campaignId: 206827,
       lastReplyDate: '2018-11-18T14:14:03+00:00'
    },
    {
        id : 1002,
        email:"emp1002@gmail.com",
        name:"emp1002 emp1002",
        title: "title 1002",
        company: "company 1002",
        campaignId: 212096,
        lastReplyDate: '2018-12-19T14:14:03+00:00'
    }
];
function postDataToDashboard(replies) {

    const repliesPostOptions = {
        jar: true,
        followAllRedirects: false,
        url:DASHBOARD_API,
        method: 'POST',
        form: {
            replies:replies,
            replyIOSecret : replyIOCredintials.replyIOSecret
        },
    };

    console.log('posting '+repliesPostOptions.form.replies.length+' data');
    request.post(repliesPostOptions,(error,response,html)=>{

        if(error){
            console.log(error);
        }
        else {
            console.log('Successfully Posted');
        }
    });
}

function filterPostFields(prospects) {
    const filteredRepliesSet = [];
    for (let prospect of prospects){
        let item = {};
        item.id = prospect.id;
        item.email = prospect.email;
        item.name = prospect.name;
        item.title = prospect.title;
        item.company = prospect.company;
        item.campaignId = prospect.campaignId;
        item.lastReplyDate = prospect.lastReplyDate;

        filteredRepliesSet.push(item);
    }
    console.log('filteredRepliesSet len is '+filteredRepliesSet.length);
    return filteredRepliesSet;
}

