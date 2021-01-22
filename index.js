//Dependency
const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);


app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile('/index.html');
});