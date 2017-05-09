'use strict';
/* AWS Lambda ships with imageMagick out of the box */
const imageMagick = require('gm').subClass({ imageMagick: true }),
    busboy = require('busboy'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3()

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports.create = function handler(event, context) {
  var contentType = event.headers['Content-Type'] || event.headers['content-type'];
  var bb = new busboy({ headers: { 'content-type': contentType }});
  var fileNum = Math.floor(Math.random() * 1000),
      fileName = `/tmp/selfie-${fileNum}.jpg`,
      s3filename = `selfie-${fileNum}.jpg`

  bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [%s]: filename=%j; encoding=%j; mimetype=%j', fieldname, filename, encoding, mimetype);

    file
    .on('data', data => console.log('File [%s] got %d bytes', fieldname, data.length))
    .on('end', function handleFile() {
      console.log('File [%s] Finished', fieldname);
      imageMagick(file)
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
    });
  })
  .on('field', (fieldname, val) =>console.log('Field [%s]: value: %j', fieldname, val))
  .on('finish', () => {
    console.log('Done parsing form!');
    context.succeed({ statusCode: 200, body: 'all done', headers });
  })
  .on('error', err => {
    console.log('failed', err);
    context.fail({ statusCode: 500, body: err, headers });
  });

  bb.end(event.body);
}
