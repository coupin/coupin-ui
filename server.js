const bodyParser = require('body-parser');
const dotenv = require('dotenv');
// server module
const express = require('express');
const methodOverride = require('method-override');

// For logging all request
const morgan = require('morgan');
// For token validation
const fs = require('fs-extra');
const cloudinary = require('cloudinary');
const cors = require('cors');
const multer = require('multer');
const upload = multer();

const app = express();
var port = process.env.PORT || 5030;

dotenv.config();

// set our port
var port = process.env.PORT || 5031;

app.use(cors());

/**
 * get all data of the body parameters
 * parse application/json
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

/**
 * override with the X-HTTP-Override header in the request.
 * Simulate DEvarE and PUT
 */
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be /img
app.use(express.static(__dirname + '/public'));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


// app.use('/admin', function (req, res) {
//   res.sendfile('public/views/index.html');
// });

// frontend routers
// app.get('/', function(req, res) {
//   res.sendfile('./public/views/welcome.html');
// });

// Sign Up Routes
app.get('/signup', function(req, res) {
  // load the index page
  res.sendfile('./public/views/signup.html', {message: req.flash('SignUpMessage')});
});

app.post('/destroy', function(req, res) {
  const data = req.body.data;
  var counter = 0;

  data.forEach(function(url) {
    console.log(url);
    cloudinary.v2.uploader.destroy(url, {
      invalidate: true
    }, function(err, result) {
      if (err) {
        console.log(err);
      }
    });
  });

  res.status(200).send('Delete Attempted');
});

app.post('/upload', upload.single('file'), function (req, res) {
  cloudinary.v2.uploader.upload_stream({
    public_id: req.body.public_id,
    overwrite: true,
    resource_type: 'image',
    timeout: 120000
  }, function(err, result) {
    if (err) {
      res.status(500).send({ error: err.message });
    } else {
      res.status(200).send(result);
    }
  }).end(req.file.buffer);
});

app.post('/uploads', upload.array('photos'), function (req, res) {
  var counter = 0;
  var error = false;
  var errorMsg = null;
  var total = req.files.length;
  var urls = [];

  req.files.forEach(function(file) {
    if (!error) {
      cloudinary.v2.uploader.upload_stream({
        overwrite: true,
        resource_type: 'image',
        timeout: 120000
      }, function(err, result) {
        if (err) {
          error = true;
          errorMsg = err;
          res.status(500).send({ error: errorMsg.message });
        } else {
          counter++;
          urls.push(result.url);
          if (counter === total) {
            res.status(200).send(urls);
          }
        }
      }).end(file.buffer);
    }
  });
});

app.get('/homepage', function(req, res) {
  // load the home page
  res.sendfile('./public/views/base.html');
});

app.get('*', function(req, res) {
  res.sendfile('./public/views/merchant/index.html');
});

//start on localhost 3030
app.listen(port).on('error', function (err) {
  console.log(err);
});

// confirmation
console.log('Too Cool for port ' + port);

// expose app
module.exports = app;