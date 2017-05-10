# OSCON Selfie Booth

This function takes an image data string and uses imageMagick to transform
the image into a "photo booth" image.

## Running locally

In order to run locally, it is expected that you have
[imageMagick](https://www.imagemagick.org/script/index.php) on your machine.

Create a bucket on S3, and be sure to edit `serverless.yml` to change the bucket
name to your new bucket name.

Install dependencies with `npm install` in this directory.

Run the function using `npm run local`.

Behind the scenes, this command runs the local install of
[Serverless framework](https://serverless.com/) (to run Serverless from your
own shell, be sure to install the framework globally using `npm install -g
serverless`, and you can run `sls invoke local -f new -p events/event.json`).

There is also a sample failing event, which can be run with `npm run failing`.

## Deploying

Be sure to edit `serverless.yml` to change the bucket name to a new name.

Run `sls deploy`

Invoke remotely using `npm run remote`, or (if you have Serverless installed
globally), run `sls invoke -f new -p events/event.json`
