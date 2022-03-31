var mysql = require('mysql');
var express = require('express');
var fs = require('fs');
var app = express();

export function saveFileData(fileData){
    alert("connected");
    fs.writeFileSync('views/fileData.json', fileData);
    alert("2");
}
