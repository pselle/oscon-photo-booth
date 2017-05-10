(function() {
  'use strict';
  document.getElementById('imageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData();
    fd.append('imageFile', document.getElementById('imageUpload').files[0]);
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.addEventListener("load", function () {
      fetch("https://31w7u6bill.execute-api.us-east-1.amazonaws.com/prod/selfie/new", {
        method: "POST",
        body: reader.result
      }).then(function(res) {
        document.getElementById('selfieResult').src = res.body.message;
      }).catch(function(err) {
        console.log(err);
      });
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  });
})();
