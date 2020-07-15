var request = require("request");

function getK() {
  return new Promise(function (resolve, reject) {

    var options = {
      "method": 'POST',
      "url": 'https://dumbgaming.auth0.com/oauth/token',
      "headers": { 'content-type': 'application/json' },
      "body": {
        "grant_type": 'client_credentials',
        "client_id": process.env.AUTH0_CLIENT_ID,
        "client_secret": process.env.AUTH0_CLIENT_SECRET,
        "audience": 'https://fragrant-recipe-2618.auth0.com/api/v2/'
      },
      "json": true
    };

    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

function getUsername(userId) {
  return new Promise(function (resolve, reject) {

    var kPromise = getK();
    kPromise.then(function (result) {
      var options = {
        method: 'GET',
        // url: 'https://fragrant-recipe-2618.auth0.com/api/v2/users/auth0|5e29feb2b9e7a90e7be09099',
        url: 'https://fragrant-recipe-2618.auth0.com/api/v2/users/' + userId,
        headers: { authorization: 'Bearer ' + result.access_token }
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }, function (err) {
    console.err(err);
  });
}

module.exports = getUsername;