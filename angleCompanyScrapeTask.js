//load modules
const request = require('request');
const moment = require('moment');

//get the system date
let systemDate = moment().format("YYYY-MM-DD");
if(process.argv.length==3){
    systemDate = process.argv[2];
}
console.log(systemDate);
//get current month and year

//fetch data by {month,year}

// fetch last day total count

//get initial page
const angelOptions = {
};






// angelOptions.method = 'POST';
angelOptions.url = 'https://angel.co/company_filters/search_data';
angelOptions.headers = {
    'X-Requested-With':'XMLHttpRequest'
};
console.log(angelOptions);
request.post(angelOptions,(error,response,html)=>{
    if(error){
        console.log(error);
    }
    else {
        console.log(html);
    }
});



// get today total count


//send post request to get id list , take a diff

// repeat as much as possible and (today total - last day total)

//get data response for id list

//extract info

//post to API

