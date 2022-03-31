var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

var app = express();
var {PythonShell} = require('python-shell');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/index.html"));
app.use(session({
    secret: 'SEisGenius',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'sendwhich-db.clwps0oblq0n.ap-northeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'sendwhich987',
        database: 'sendwhich'
      })
}));

app.listen(3000,  function () {
    console.log('서버 실행 중...');
});

// app.get('/', (req, res) => {    
//     if(req.session.logined) {
//       res.render('logout', { id: req.session.user_id });
//     } else {
//       res.render('login');
//     }
// });


var connection = mysql.createConnection({
    host: "sendwhich-db.clwps0oblq0n.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    database: "sendwhich",
    password: "sendwhich987",
    port: 3306
});

var albumBucketName = 'sendwhich';
var bucketRegion = 'ap-northeast-2';
var IdentityPoolId = 'ap-northeast-2:61ad26b5-fc3a-494d-8969-9b31a6c04bc5';
    
var AWS = require("aws-sdk");
    
AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});
    
var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: albumBucketName}
});

var router = require('./router/web')(app);

var fileName;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('views'));

app.get('/index', function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get('/receiver', function(req, res) {
    res.sendFile(__dirname + "/views/receiver.html");
  });

app.get('/result', function(req, res) {
    res.sendFile(__dirname + "/views/result.html");
});

app.get('/receive_list', function(req, res) {
    res.sendFile(__dirname + "/views/receive_list.html");
});

app.get('/receive_with_code', function(req, res) {
    res.sendFile(__dirname + "/views/receive_with_code.html");
});

app.get('/getMine', function(req, res) {
    res.sendFile(__dirname + "/getMyList");
});

app.get('/send_complete', function(req, res) {
    res.sendFile(__dirname + "/views/send_complete.html");
});

app.get('/certnum_list', function(req, res) {
    res.sendFile(__dirname + "/views/certnum_receive_list.html");
});

app.post('/user/join', function (req, res) {
    console.log(req.body);
    var userEmail = req.body.userEmail;    var userPwd = req.body.userPwd;
    var userName = req.body.userName;

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO Users (UserEmail, UserPwd, UserName) VALUES (?, ?, ?)';
    var params = [userEmail, userPwd, userName];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {

            var status = {
                "status": 200,
                "message": 'login success'
              }
        }
        //res.send()
        res.redirect('/index');
    });
});

// app.post('/user/logout', (req, res) => {     
//     sess = req.session;
//     if(sess.username){
//         req.session.destroy(function(err){
//         if(err){
//             console.log(err);
//         }else{
//             res.redirect('/');
//         }
//     });
// });

app.post('/user/logout', function (req, res){
    req.session.logined = false;
    console.log(req.session.logined);
    res.redirect('/');
});

app.post('/user/login', function (req, res) {
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var sql = 'select * from Users where UserEmail = ?';

    connection.query(sql, userEmail, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            if (result.length == 0) {
                resultCode = 204;
                message = '존재하지 않는 계정입니다!';
            } else if (userPwd !== result[0].UserPwd) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
            } else {
                var sess;
                sess = req.session;
                sess.username = userEmail;
                sess.logined = true;

                resultCode = 200;
                message = '로그인 성공! ' + result[0].UserName + '님 환영합니다!';
            }
        }

        res.redirect('/index');
    });
});



//세션을 확인해 줄 것임
app.post('/user/check', function(req, res){
    

    res.json({
        'code': resultCode,
        'message': message
    });
});

app.get('/user/showmem', function (req, res){
    
    var sql = 'select * from Users';

    connection.query(sql,function(err,rows,fields){
        if(!err){

            const newrows=JSON.stringify(rows);//DB의 칼럼값을 json으로 형변환
            fs.writeFileSync('views/mem.json', newrows); //json파일로 만들기
            console.log(newrows);
	    res.json(rows);
        }
        else{
            console.log('Error while performing Query.', err);
        }
    });
   
});

app.post('/isLogin', function(req, res){
    console.log(req.session.logined);
    if (req.session.logined == true) {
        res.redirect('/receive_list');
    } else {
        res.redirect('/receive_with_code');
    }
    
});

app.post('/getCertNum', function (req, res) {
    var certNum = req.body.certNum;
    var sql = 'select * from Filelist where certNum = ?';

    connection.query(sql, certNum, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';
	var filename;
        if (err) {
            console.log(err);
        } else {
            if (result.length == 0) {
                conlsole.log('1');
		resultCode = 204;
                message = '존재하지 않는 계정입니다!'            
		} else {
		console.log(certNum);
		console.log(result);
                resultCode = 200;
                message = '비회원 다운로드 성공!';
		//filename=result.filename;
		//res.json(result.fileName);
            }
        }
    })
});

app.post('/getMyList', function (req, res){
    var myname = req.session.username;
    var sql = 'select * from Filelist where getId = ?';

    connection.query(sql, myname, function (err, result){
        if(!err){
            const news=JSON.stringify(result);
            fs.writeFileSync('views/myReceivedFiles.json', news);
        }else{
            console.log('에러에러렝렁렁러', err);
        }
    });
});

app.post('/download', function (req, res){

    var fileName = req.body.fileName;
    var link = req.body.link;

    var file = fs.createWriteStream(fileName);
    var params = {Bucket:'sendwhich', Key: String(fileName)};
    s3.getObject(params).createReadStream().pipe(file);

    res.redirect(link);
});

app.get('/getlist', function (req, res) {
    var sql = 'select * from Filelist';

    connection.query(sql,function(err,rows,fields){
        if(!err){
            res.json(rows);
        }
        else{
            console.log('Error while performing Query.', err);
        }
    });

});



app.post('/getFileList', function (req, res){

    var bucketParams = {
        Bucket : 'sendwhich',
      };

    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.Contents[0]);
        }

        var jsonObject = Array();

        for(var i=0; i<data.Contents.length; i++) {
            var fileData = new Object();
            fileData.name = data.Contents[i].Key;
            fileData.size = data.Contents[i].Size;

            console.log(fileData);
            jsonObject.push(fileData);
        }

        var toJson = JSON.stringify(jsonObject);
        fs.writeFileSync('views/recieved_filelist.json', toJson);
      });

    res.json({
        'code' : 200,
        'message' : "ok"
    });
});



app.post('/sendFileData', function (req, res){
    console.log(req.body);
    var sendId = req.body.sendId;       var getId = req.body.getId;
    var filename = req.body.filename;   var timestamp = req.body.time;
    var filesize = req.body.filesize;   var fileS3path = req.body.path;
    var certNum = req.body.fiesize;	var indexNum = req.body.path;
    
    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO Filelist (sendId, getId, filename, timestamp, filesize, fileS3path, certNum, indexNum) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var params = [sendId, getId, filename, timestamp, filesize, fileS3path, certNum, indexNum];
    
    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            var status = {
                "status": 200,
                "message": 'file sended success'
              }
        }
    });
});

app.post('/sendFileData2', function (req, res){

    // console.log('masking');

    // 변수 받아오기(checkbox 체킹 여부)
    var checkCode = req.body.checkCode;
    console.log(checkCode);
    

    console.log("인증번호 생성 체크여부: " + checkCode);
     
    // 랜덤으로 인증코드 생성
    var randomCode;

    var generateRandom = function (min, max) {
        var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
        return ranNum;
    }
    
    // 경우에 따른 파이썬 모듈 실행   
    if (checkCode)
    {
        randomCode = generateRandom(100000, 999999);
        console.log('인증코드: ' + randomCode);
    }


    console.log(req.session.username);
    console.log(req.body);
    var sendId = req.session.username;       var getId = req.body.getId;
    var filename = req.body.filename;   var timestamp = req.body.time;
    var filesize = req.body.filesize;   var fileS3path = req.body.path;
    var certNum = randomCode;	var indexNum = req.body.path;
    

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO Filelist (sendId, getId, filename, timestamp, filesize, fileS3path, certNum, indexNum) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    var params = [sendId, getId, filename, timestamp, filesize, fileS3path, certNum, indexNum];
    
    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            var status = {
                "status": 200,
                "message": 'file sended success'
              }
        }

    });
    res.redirect('/send_complete');
});

app.post('/makejsonfile', function (req, res){
    console.log("makejson");
    var jsonName = req.body.sibal;
    var downName = req.body.fileName;

    fs.writeFileSync('views/example.json', jsonName); //json파일로 만들기

    console.log(downName);

    var file = fs.createWriteStream(downName);
    var params = {Bucket:'sendwhich', Key: String(downName)};
    s3.getObject(params).createReadStream().pipe(file);

    res.redirect('/result');
});

app.post('/why', function (req, res){
    console.log('makejson');

    res.redirect('/result');
});


app.post('/checking', function (req, res){

    // console.log('masking');

    // 변수 받아오기(checkbox 체킹 여부)
    var checkID = req.body.checkID;
    var checkPP = req.body.checkPP;
    var checkD = req.body.checkD;
    var checkP = req.body.checkP;
    var checkF = req.body.checkF;
    var checkC = req.body.checkC;
    var checkHI = req.body.checkHI;

    console.log("주민번호 체크여부: " + checkID);
    console.log("여권번호 체크여부: " + checkPP);
    console.log("운전면허번호 체크여부: " + checkD);
    console.log("휴대폰번호 체크여부: " + checkP);
    console.log("외국인번호 체크여부: " + checkF);
    console.log("카드번호 체크여부: " + checkC);
    console.log("건강보험번호 체크여부: " + checkHI);
     
    
    // 경우에 따른 파이썬 모듈 실행   
    if (checkID)
    {
        PythonShell.run('./views/maskID.py', null, function (err, results) {
            if (err) throw err;
                console.log('maskID.py finished.');
                console.log('results', results);
        });
    }
    else if (checkID == undefined && checkPP)
    {
        PythonShell.run('./views/maskPP.py', null, function (err, results) {
            if (err) throw err;
                console.log('maskPP.py finished.');
                console.log('results', results);
        });
    }
    else if (checkD)
    {
        PythonShell.run('./views/maskD.py', null, function (err, results) {
            if (err) throw err;
                console.log('maskD.py finished.');
                console.log('results', results);
        });
    }
    else if (checkP)
    {
        PythonShell.run('./views/maskP.py', null, function (err, results) {
            if (err) throw err;
                console.log('maskp.py finished.');
                console.log('results', results);
        });
    }
    else if (checkF)
    {
        PythonShell.run('./views/maskF.py', null, function (err, results) {
            if (err) throw err;
                console.log('maskF.py finished.');
                console.log('results', results);
        });
    }
    else if (checkC)
    {
        PythonShell.run('./views/maskC.py', null, function (err, results) {
            if (err) throw err;
                console.log('maskC.py finished.');
                console.log('results', results);
        });
    }
    else if (checkHI)
    {
        PythonShell.run('./views/maskHI.py', null, function (err, results) {
            if (err) throw err;
            console.log('maskHI.py finished.');
                console.log('results', results);
        });
    }

    res.redirect("/receiver");
});

app.post('/certificating', function (req, res){

    // 변수 받아오기(입력한 인증코드)
    var inputCode = req.body.inputCode;

    console.log("입력한 인증코드: " + inputCode);


    // db의 인증코드 가져오기
    var sql = 'select * from Filelist where certNum = ?';
    //console.log("유효한 인증코드 목록: ");


    connection.query(sql, inputCode, function (err, result) {
        var resultCode = 404;
        var certmessage = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            if (result.length == 0) {
                resultCode = 204;
                certmessage = '유효한 인증코드가 아닙니다!';
            } else {
                resultCode = 200;
                certmessage = '인증되었습니다!';

                const news=JSON.stringify(result);
                fs.writeFileSync('views/certNumFiles.json', news);

                // 해당 파일 다운받는 코드
            }
        }

        // 저장한 메세지를 띄우기
        console.log(certmessage);
    });

    res.redirect('/certnum_list');
});
