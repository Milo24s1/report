const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const jetbuzzCredintials = require('./config/jetbuzzCredintials');
const DASHBOARD_API = `http://dash.prospectgenai.com/api/jetbuzzUpdate`;


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
						const jetbuzzAccounts = getAccounts(html);
						for (let k in jetbuzzAccounts){
							const accountGetOption = {
								jar: true,
								followAllRedirects: true,
								url:jetbuzzAccounts[k],
								method: 'GET'
							};

							request.get(accountGetOption,(error,response,html)=>{

								if(error){
									console.log('account crawling error'+error);
								}

								else {
                                    const accountInfo = getAccountinfo(html);
                                    accountInfo.accountEmail = k;
                                    accountInfo.jetbuzzSecret = jetbuzzCredintials.jetbuzzSecret;

                                    const accountPostOptions = {
                                        jar: true,
                                        followAllRedirects: false,
                                        url:DASHBOARD_API,
                                        method: 'POST',
                                        form: accountInfo,

                                    };

                                    request.post(accountPostOptions,(err,response,html)=>{
                                        if(err){
                                            console.log(err);
                                        }
                                        else {
                                            console.log(html);
                                        }
                                    });
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


function getAccountinfo(html) {
	const $ = cheerio.load(html);
	const accountInfo = {};
	accountInfo.connectionRequest = Number($(".col-md-8 .box:first-child tr:nth-child(2) td:nth-child(5)").text());
	accountInfo.connected = Number($(".col-md-8 .box:first-child tr:nth-child(3) td:nth-child(5)").text());
	accountInfo.replied_to_connection  = Number($(".col-md-8 .box:first-child tr:nth-child(4) td:nth-child(5)").text());
	accountInfo.replied_to_other_messages  = $(".col-md-8 .box:first-child tr:nth-child(5) td:nth-child(5)").text();

	return accountInfo;
}


function postToDashboard() {
    const accountInfo = {};
    accountInfo.connectionRequest = 199;
    accountInfo.connected = 189;
    accountInfo.replied_to_connection  = 179;
    accountInfo.replied_to_other_messages  = 169;
    accountInfo.accountEmail = '';

    const accountPostOptions = {
        jar: true,
        followAllRedirects: false,
        url:DASHBOARD_API,
        method: 'POST',
        form: accountInfo,


    };

    console.log(accountPostOptions);
    request.post(accountPostOptions,(err,response,html)=>{
        if(err){
            console.log(err);
        }
        else {
            console.log(html);
        }
    });
}
//postToDashboard();
run();

