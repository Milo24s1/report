const express =  require('express');

const app = express();
const port = process.env.PORT || 9999;


app.listen(port, function(){

    console.log('Server is running on port:', port);
});


app.get('/', function(req, res){
    res.send('testing');
});
