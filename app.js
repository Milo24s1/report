const express =  require('express');
var bodyParser = require('body-parser');
const CompanyController = require('./src/model/company');

const app = express();
const port = process.env.PORT || 9999;


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.listen(port, function(){

    console.log('Server is running on port:', port);
});


app.get('/', function(req, res){
    res.send('testing');
});



app.get('/newcompany', function(req, res){
    res.render('add');
});