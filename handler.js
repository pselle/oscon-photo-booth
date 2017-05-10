'use strict';
/* AWS Lambda ships with imageMagick out of the box */
const imageMagick = require('gm').subClass({ imageMagick: true }),
    busboy = require('busboy'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    fs = require('fs');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function doMagic(image, fileEnding) {
  return new Promise((resolve, reject) => {
    imageMagick(image)
      .resize(400)
      .borderColor("RGB(185,0,45)") // OSCON red
      .border(30, 40)
      .fontSize(24)
      .fill("RGB(255,255,255)")
      .font('URWTypewriterT.ttf')
      .drawText(165, 30, "OSCON 2017")
      .write(`/tmp/sourceFile`, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve('/tmp/sourceFile-1.png');
      });
  });
}

function writeToS3(sourceFile) {
  return new Promise((resolve, reject) => {
    const fileNum = Math.floor(Math.random() * 1000),
        s3filename = `selfie-${fileNum}.jpg`,
        imgdata = fs.readFileSync(sourceFile),
        s3params = {
         Bucket: process.env.BUCKET,
         Key: s3filename,
         Body: imgdata,
         ContentType: 'image/jpeg',
         ACL: "public-read"
      };

    s3.putObject(s3params,
      (err, obj) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          statusCode: 200,
          body: JSON.stringify({
            message: `https://s3.amazonaws.com/${s3params.Bucket}/${s3filename}`
          })
        })
      }
    );
  });
}

module.exports.create = function handler(event, context, cb) {
  var contentType = event.headers['Content-Type'] || event.headers['content-type'];
  var bb = new busboy({ headers: { 'content-type': contentType }});

  bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [%s]: filename=%j; encoding=%j; mimetype=%j', fieldname, filename, encoding, mimetype);
    const fileEnding = mimetype.split('/')[1]
    file.pipe(fs.createWriteStream(`/tmp/srcimg.${fileEnding}`))
      .on('finish', function() {
        console.log('Successfully wrote file');
        // doMagic(`/tmp/srcimg.${fileEnding}`, fileEnding).then(function(src) {
        //   console.log(src);
        //   console.log("HUZZAH")
        // }).catch((err => {console.log(err)}))
        writeToS3(`/tmp/srcimg.${fileEnding}`)
          .then(function(response) {
            context.succeed(response)
          }).catch((err) => {
            console.log(err)
            context.fail({ statusCode: 500, body: err, headers });
          })
    });

    file.on('data', function(data) {
       console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
     }).on('end', function() {
       console.log('File [' + fieldname + '] Finished');
     });
  })
  .on('field', (fieldname, val) =>console.log('Field [%s]: value: %j', fieldname, val))
  .on('finish', () => {
    console.log('Done parsing form!');
    // context.succeed({ statusCode: 200, body: 'all done', headers });
  })
  .on('error', err => {
    console.log('failed', err);
    context.fail({ statusCode: 500, body: err, headers });
  });

  bb.end(event.body);
}


exports.image = function(event, context) {
  imageMagick('photo.jpg')
  .resize(400)
  .borderColor("RGB(185,0,45)") // OSCON red
  .border(30, 40)
  .fontSize(24)
  .fill("RGB(255,255,255)")
  .font('URWTypewriterT.ttf')
  .drawText(165, 30, "OSCON 2017")
  .write('foo.jpg', (err) => {
    console.log(err)
  })
  context.succeed();
}

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.ending = response.type.split('/')[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

exports.newSelfie = function(event, context) {
  const fileNum = Math.floor(Math.random() * 1000);
  var imageBuffer = decodeBase64Image(event.body);
  // const filename = `/tmp/test1.${imageBuffer.ending}`;
  const filename = `original-${fileNum}.${imageBuffer.ending}`;
  fs.writeFileSync(filename, imageBuffer.data);
  doMagic(filename, imageBuffer.ending)
    .then(function(fileLocation) {
      writeToS3(fileLocation)
        .then(function(response) {
          context.succeed(response);
        })
        .catch(function(e) {
          context.fail({ statusCode: 500, body: JSON.stringify(e), headers });
        })
    })
    .catch(function(e) {
      context.fail({ statusCode: 500, body: JSON.stringify(e), headers });
    })
}
