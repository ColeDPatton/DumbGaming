var express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();

router.get('/user', secured(), function (req, res, next) {
    res.render('userview', { 
      username: req.user[0].player_username,
      time: req.user[0].best_time,
      level: req.user[0].campaign_level
    });
});

module.exports = router;