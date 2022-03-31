var AWS = require('aws-sdk');
var fs = require('fs');

var albumBucketName = 'sendwhich';
var bucketRegion = 'ap-northeast-2';
var IdentityPoolId = 'ap-northeast-2:61ad26b5-fc3a-494d-8969-9b31a6c04bc5';

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

function s3Download(){
    // s3.getObject(
    //     { Bucket: "sendwhich", Key: "aa.jpg" },
    //     function (error, data) {
    //       if (error != null) {
    //         alert("Failed to retrieve an object: " + error);
    //       } else {
            
    //         // do something with data.Body
    //       }
    //     }
    //   );

    var file = fs.createWriteStream(fileName);
    var params = {Bucket:'sendwhich', Key: "aa.jpg"};
    s3.getObject(params).createReadStream().pipe(file);
}
