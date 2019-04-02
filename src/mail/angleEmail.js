const AngleCompany = require('../../model/angleCompany');
const mainConfig = require('../../config/mainConfig');
const REPLIES_SHOWN_IN_EMAIL = 12;
const moment = require('moment');
class AngleEmail {



    getEmailBody(rowData,customSelection,customMessage,scraperName){
        customSelection = customSelection.map(o=>parseInt(o));
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
                            ${customSelection.indexOf(1)>-1?'<th style="padding-left: 0.75rem;" scope="col">Company</th>':''}
                            ${customSelection.indexOf(2)>-1?'<th scope="col">Description</th>':''}
                            ${customSelection.indexOf(3)>-1?'<th scope="col">Joined</th>':''}
                            ${customSelection.indexOf(4)>-1?'<th scope="col">Location</th>':''}
                            ${customSelection.indexOf(5)>-1?'<th scope="col">Market</th>':''}
                            ${customSelection.indexOf(6)>-1?'<th scope="col">Website</th>':''}
                            ${customSelection.indexOf(7)>-1?'<th scope="col">Added</th>':''}
                            
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
        for(var i=0;i<REPLIES_SHOWN_IN_EMAIL;i++){


            html += `<tr>
                            ${customSelection.indexOf(1)>-1?`<th style='font-size: 14px;width: 15%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'scope="row">${rowData[i].name}</th>`:''}
                            ${customSelection.indexOf(2)>-1?`<td style='font-size: 14px;width: 15%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].description}</td>`:''}
                            ${customSelection.indexOf(3)>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].joined}</td>`:''}
                            ${customSelection.indexOf(4)>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].location}</td>`:''}
                            ${customSelection.indexOf(5)>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].market}</td>`:''}
                            ${customSelection.indexOf(6)>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'><a href="${rowData[i].website}">${rowData[i].website?'web':''}</a> </td>`:''}
                            ${customSelection.indexOf(7)>-1?`<td style='font-size: 14px;width: 10%;border-bottom-color: rgb(222, 226, 230);
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
        vertical-align: bottom;'>${rowData[i].addedDate} (${rowData[i].responsesPercentage}%)</td>`:''}
                                        
                                        
                                        
                                        
                                        
                                        
                                        
                                        </tr>`;
        }

        html += `</tbody></table>`;

        return header+html;
    };

    getDataSet(options,callback){
        const data = [];
        const error = null;
        try {
            const today = moment().startOf('day');
            const query= {addedDate:{$gte: today,
                    $lte: moment(today).endOf('day')}};
            AngleCompany.getCompanyList(query,null,null,callback);
        }
        catch (e) {

            callback(error,data);
        }

    }

    getCSVcontent(data,customSelection){
        //TODO improve this method
        const formattedContent = [];

        if(mainConfig.isAngleCsvEnabled) {
            for (let i = 0; i < data.length; i++) {
                const row = {};

                if (customSelection.indexOf(1) > -1) {
                    row['Name'] = data[i].name;
                }
                if (customSelection.indexOf(2) > -1) {
                    row['Description'] = data[i].description;
                }
                if (customSelection.indexOf(3) > -1) {
                    row['Joined'] = data[i].joined;
                }
                if (customSelection.indexOf(4) > -1) {
                    row['Location'] = data[i].location;
                }
                if (customSelection.indexOf(5) > -1) {
                    row['market'] = data[i].market;
                }
                if (customSelection.indexOf(6) > -1) {
                    row['Website'] = data[i].website;
                }

                formattedContent.push(row);
            }
        }

        return formattedContent;
    }
}
module.exports = AngleEmail;