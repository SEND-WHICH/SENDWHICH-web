

    // var file = require('fs').createWriteStream('anonymous.png');
    // var params = {Bucket:'sendwhich', Key:'anonymous.png'};
    // s3.getObject(params).createReadStream().pipe(file);



function jsdownload(){
    var albumBucketName = 'sendwhich';
    var bucketRegion = 'ap-northeast-2';
    var IdentityPoolId = 'ap-northeast-2:61ad26b5-fc3a-494d-8969-9b31a6c04bc5';

    //var AWS = require("aws-sdk");
    alert("1");
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

    
    alert("2");
    const fs = require('fs');
    var file = fs.createWriteStream('anonymous.png');
    alert("3");
    var params = {Bucket:'sendwhich', Key:'anonymous.png'};
    alert("4");
    s3.getObject(params).createReadStream().pipe(file);
    
}
