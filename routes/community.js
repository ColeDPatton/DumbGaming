var express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();

router.get('/community', function (req, res, next) {
    res.render('communityLevels', { 
      // username: req.user[0].player_username
    });
});

module.exports = router;