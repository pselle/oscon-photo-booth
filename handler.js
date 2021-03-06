'use strict';
/* AWS Lambda ships with imageMagick out of the box */
const imageMagick = require('gm').subClass({ imageMagick: true }),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3(),
    fs = require('fs');

function doMagic(image, fileEnding) {
  return new Promise((resolve, reject) => {
    imageMagick(image)
      .resize(400)
      .borderColor("RGB(185,0,45)") // OSCON red
      .border(30, 40)
      .fontSize(24)
      .fill("RGB(255,255,255)")
      .font('resources/URWTypewriterT.ttf')
      .drawText(165, 30, "OSCON 2017")
      .write(`/tmp/sourceFile`, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve('/tmp/sourceFile');
      });
  });
}

function writeToS3(sourceFile) {
  return new Promise((resolve, reject) => {
    const fileNum = Math.floor(Math.random() * 100000),
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
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: `https://s3.amazonaws.com/${s3params.Bucket}/${s3filename}`
          })
        })
      }
    );
  });
}

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (!matches || matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.ending = response.type.split('/')[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

exports.newSelfie = function(event, context) {
  const fileNum = Math.floor(Math.random() * 100000);
  const imageBuffer = decodeBase64Image(event.body);
  if (imageBuffer instanceof Error) {
    return context.fail({ statusCode: 500, body: imageBuffer.message });
  }
  const filename = `/tmp/original-${fileNum}.${imageBuffer.ending}`;
  // Write data to a file we can use in imageMagick
  console.log('write the file to ', filename);
  fs.writeFileSync(filename, imageBuffer.data);
  // Do the magic
  doMagic(filename, imageBuffer.ending)
    .then(function(fileLocation) {
      console.log('imagemagic succeeded')
      // Just a little bit of callback heck to get us to s3
      writeToS3(fileLocation)
        .then(function(response) {
          console.log('sending success')
          context.succeed(response);
        })
        .catch(function(e) {
          console.log(e)
          context.fail({ statusCode: 500, body: JSON.stringify(e) });
        })
    })
    .catch(function(e) {
      console.log(e)
      context.fail({ statusCode: 500, body: JSON.stringify(e) });
    })
}
