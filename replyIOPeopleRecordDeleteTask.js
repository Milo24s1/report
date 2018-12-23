const moment = require('moment');
const request = require('request');
const replyIOCredintials = require('./config/replyIOCredintials');
let systemDate = moment().format("YYYY-MM-DD");
const DELETE_API_PATH = 'http://localhost:9999/api/deleteReplyIOPeople';
if(process.argv.length==3){
    systemDate = process.argv[2];
}


const deletePostOption = {
  url: DELETE_API_PATH,
  method: 'POST',
  form:{
      from: systemDate,
      replyIOSecret: replyIOCredintials.replyIOSecret
  }
};

function run() {

    request.post(deletePostOption,(error,response,html)=>{
        if(error){
          console.log(error);
        }
        else {
            console.log("successfully Deleted records before "+systemDate);
            console.log(html);
        }
    })
}


run();