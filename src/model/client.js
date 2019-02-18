const ClientController ={};
const request = require('request');
const mainConfig= require('../../config/mainConfig');
const API_PATH = mainConfig.inboxAppUrl;

ClientController.addUser = function(req,res){

    //TODO do a validation here

    const postOption = {
        url:`${API_PATH}/addUser`,
        method: 'POST',
        form:req.body
    };
    try {
        request.post(postOption,(err,response,html)=>{
            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(response.statusCode).send(JSON.parse(html));
            }
        });
    }
    catch (e) {
        res.status(500).send({e:e});
    }




};

ClientController.searchUsers = function(req,res){
    const postOption = {
        url:`${API_PATH}/searchUsers`,
        method: 'POST',
        form:{
            searchParams:req.body.searchParams,
            fields :{username:1,clientName:1,isActive:1,jetbuzzAccounts:1},
            pageNumber:req.body.pageNumber,
            sortParams: req.body.sortParams,
        }
    };
    request.post(postOption,(err,response,html)=>{
        res.send(JSON.parse(html));
    });
};

ClientController.deleteUser = function(req,res){
    try {
        const deleteOption = {
            url:`${API_PATH}/user/${req.params.id}`,
            method: 'DELETE'
        };
        request.delete(deleteOption,(error,response,html)=>{
            if (error){

            }
            else {
                res.send(response.statusCode);
            }
        });
    }
    catch (e) {

    }
};

ClientController.editUser = function(req,res){
    //TODO do a validation here

    const postOption = {
        url:`${API_PATH}/editUser/${req.body.id}`,
        method: 'POST',
        form:req.body.user
    };
    try {
        request.post(postOption,(err,response,html)=>{
            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(response.statusCode).send(JSON.parse(html));
            }
        });
    }
    catch (e) {
        res.status(500).send({e:e});
    }
};

ClientController.changePassword = function(req,res){
    //TODO do a validation here

    const postOption = {
        url:`${API_PATH}/changePassword/${req.body.id}`,
        method: 'POST',
        form:req.body.user
    };
    try {
        request.post(postOption,(err,response,html)=>{
            if(err){
                res.status(500).send({err:err});
            }
            else {
                res.status(response.statusCode).send(JSON.parse(html));
            }
        });
    }
    catch (e) {
        res.status(500).send({e:e});
    }
};


module.exports = ClientController;