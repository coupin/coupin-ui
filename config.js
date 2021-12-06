var dotenv = require('dotenv');
dotenv.config();

var defaultUrl = 'http://localhost:' + process.env.API_PORT;
var variables = {
  apiUrl: process.env.API_URL || defaultUrl,
  payStackId: process.env.PAY_STACK_ID || 'pk_test_e34c598056e00361d0ecceefac6299eef29b7e46',
  updatePwd: process.env.UPDATE_PASS
};


var environments = {
  development: {
    ENV_VARS: variables
  },
  staging: {
    ENV_VARS: variables
  },
  production: {
    ENV_VARS: variables
  }
};


module.exports = environments;
