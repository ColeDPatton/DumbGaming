var express = require('express');
var securedUser = require('../lib/middleware/securedUser');
var router = express.Router();

router.get('/creative', securedUser(), function (req, res, next) {
    res.render('creativemode', { 
      username: req.user[0].player_username,
      time: req.user[0].best_time,
      level: req.user[0].campaign_level
    });
});

module.exports = router;