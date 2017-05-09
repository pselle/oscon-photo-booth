'use strict';
/* AWS Lambda ships with imageMagick out of the box */
var imageMagick = require('gm').subClass({ imageMagick: true }),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3()

module.exports.create = (event, context, cb) => {
  console.log(event.body);
  try {
    var fileNum = Math.floor(Math.random() * 1000),
        fileName = `/tmp/selfie-${fileNum}.jpg`,
        s3filename = `selfie-${fileNum}.jpg`

    imageMagick(event.data)
      .resize(400)
      // .DO STUFF!!! (add border, draw OSCON on it)
      .write(fileName, (err) => {
        if (err) {
          console.log("Error writing file: ", err)
          return cb(err)
        }
        var imgdata = fs.readFileSync(fileName)
        var s3params = {
           Bucket: process.env.BUCKET,
           Key: s3filename,
           Body: imgdata,
           ContentType: 'image/jpeg',
           ACL: "public-read"
        }
        s3.putObject(s3params,
          (err, obj) => {
            cb(err, {
              statusCode: 200,
              body: JSON.stringify({
                message: `https://s3.amazonaws.com/${s3params.Bucket}/${s3filename}`,
                input: event,
              })
            })
          }
        )
      })
  }
  catch (err) {
    return cb(err, null)
  }
}
