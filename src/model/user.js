const auth = require('basic-auth');
const config = require('../../config/userConfig');
const User = {};

User.checkUser = function (req, res, next) {
    var user = auth(req);
    if(user==undefined){
        res.set({
            'WWW-Authenticate': 'Basic realm="Restricted Area"'
        }).sendStatus(401);
    }

    else if (user.pass !== undefined && user.pass == config.systemPassword && user.name ==config.systemUserName){
        next();
    }
    else{
        res.set({
            'WWW-Authenticate': 'Basic realm="Restricted Area"'
        }).sendStatus(401);
    }

};

module.exports = User;