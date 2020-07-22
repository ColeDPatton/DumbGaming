const express = require('express');
var session = require('express-session');
const app = express();
const path = require('path');
var socket = require('socket.io');
var userInViews = require('./lib/middleware/userInViews');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var creativeRouter = require('./routes/creative');
var communityRouter = require('./routes/community');
var userInfo = require('./userInfo');
var helmet = require('helmet');
var mysql = require('mysql');
const tls = require('tls');

app.set('view engine', 'ejs');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bf2457c9295d63',
    password: '531468a6',
    database: 'heroku_c8f2eecf727fe92'
});

tls.DEFAULT_MAX_VERSION = 'TLSv1.3';
tls.DEFAULT_MIN_VERSION = 'TLSv1.1';

var server = app.listen(process.env.PORT || 4000, function () {
    console.log('node js server is running');
});

var io = socket(server);

var sess = {
    secret: 'SGNPSPKMEW15KLM',
    cookie: {},
    resave: false,
    saveUninitialized: true
};

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            // defaultSrc: ["'self'"],
            // styleSrc: ["'self'"],
            // scriptSrc: ["'self'"],
            reportUri: 'report-violation',
            objectSrc: ["'self'"],
            upgradeInsecureRequests: true,
        },
    },
    referrerPolicy: {policy: 'same-origin'},
}));



if (app.get('env') === 'production') {
    sess.cookie.secure = true;

    app.set('trust proxy', 1);
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(session(sess));

var dotenv = require('dotenv');
dotenv.config();

var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

var currentUser;
var users = [];

var strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL:
            process.env.AUTH0_CALLBACK_URL || 'http://localhost:4000/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
        userInfo(profile.id).then(function (result) {
            let signInQuery = 'select * from players where player_username = ?';
            currentUser = result.username;
            let query = mysql.format(signInQuery, [result.username]);
            pool.query(query, (err, rows) => {
                if (err) {
                    return console.error(err.message);
                }
                else if (rows.length > 0) {
                    //returning user
                    return done(null, rows);
                }
                else {
                    //new user
                    let signUpQuery = 'insert into players SET ?';
                    pool.query(signUpQuery, {
                        player_username: result.username, email: result.email, best_time: 9999999,
                        hardcore_level: 0, campaign_level: 0, last_login: result.last_login, logins_count: result.logins_count,
                        email_verified: result.email_verified
                    }, (err, response) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            return done(null, [{
                                player_username: result.username,
                                best_time: 9999999,
                                campaign_level: 0
                            }]);
                        }
                    });
                }
            });
        }, function (err) {
            console.error(err);
        });
        // return done(null, profile);
    }
);

passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(userInViews());
app.use('/', authRouter);
app.use('/', usersRouter);
app.use('/', creativeRouter);
app.use('/', communityRouter);
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/code'));
app.use(express.static(__dirname + '/style_code'));

io.on('connection', function (socket) {
    console.log("New connection. There are " + socket.client.conn.server.clientsCount + " total.");

    const sessionID = socket.id;

    if (!users.find(item => item.id === sessionID)) {
        if (currentUser) {
            socket.emit('setSessionID', { sid: sessionID });
            users.push({ id: sessionID, name: currentUser });
            currentUser = null;
        } else {
            socket.emit('getSessionID');
        }
    }
    socket.on('getSessionIDResponse', function (data) {
        if (data.sid && users.find(item => item.id === data.sid)) {
            users.push({ id: sessionID, name: (users.find(item => item.id === data.sid)).name });
            socket.emit('setSessionID', { sid: sessionID });
            users.splice(users.indexOf(users.find(item => item.id === data.sid)), 1);
        } else {
            users.push({ id: sessionID, name: "" });
        }

    });

    // socket.on('checkNameR', function (data) {
    //     console.log(data.n);
    //     if (data.n)
    //         users.push({ id: sessionID, name: data.n });
    //     else {
    //         console.log("giving socket: " + sessionID + " a blank user");
    //         users.push({ id: sessionID, name: "" });
    //     }
    // });

    //load leaderboard
    let getTimeLeaderboard = 'select player_username, best_time from players order by best_time asc limit 10';
    pool.query(getTimeLeaderboard, (err, rows) => {
        if (err) {
            socket.emit('topTenResponse', { success: false });
            return console.error(err.message);
        } else {
            socket.emit('topTenResponse', { success: true, leaderboard: rows });
        }
    });

    socket.on('saveLevel', function (data) {
        let checkForNameAvailability = 'select * from custom_blocks_table where custom_level_name = ?';
        pool.query(checkForNameAvailability, data.levelName, (err, response) => {
            if (err) {
                return console.error(err);
            } else if (response.length > 0) {
                if (response[0].username === (users.find(item => item.id === sessionID)).name) {
                    let overrideCustomLevel = 'delete from custom_blocks_table where (username = ?) and (custom_level_name = ?)';
                    pool.query(overrideCustomLevel, [(users.find(item => item.id === sessionID)).name, data.levelName], (err, response) => {
                        if (err) {
                            return console.error(err.message);
                        }
                    });
                } else {
                    console.log("name taken");
                    return;
                }
            }
            var blocks_table = [];
            data.blocks.forEach(b => {
                blocks_table.push([(users.find(item => item.id === sessionID)).name, data.levelName, 1, b.x, b.y, b.w, b.h, b.goal, b.invisible, b.ghost, b.deadly, b.bouncy, b.xSpeed, b.ySpeed, b.centerX, b.centerY, b.rotationalSpeed, b.distanceFromCenter, b.angle, b.xMin, b.xMax, b.yMin, b.yMax]);
            });
            let saveLevelQuery = 'insert into custom_blocks_table(username, custom_level_name, public, x, y, w, h, goal, invisible, ghost, deadly, bouncy, xSpeed, ySpeed, centerX, centerY, rotationalSpeed, distanceFromCenter, angle, xMin, xMax, yMin, yMax) VALUES ? ';
            pool.query(saveLevelQuery, [blocks_table], (err, response) => {
                if (err) {
                    return console.error(err.message);
                } else {
                    socket.emit('saveLevelResponse', { saved: true, name: data.levelName, newLevel: data.newLevel });
                }
            });


        });
    });
    socket.on('loadNextLevel', function (data) {
        let getCurrentLevel = '';
        let updateLevel = '';
        if (data.mode === 2) {
            getCurrentLevel = 'select hardcore_level from players where player_username = ?';
            updateLevel = 'UPDATE players SET hardcore_level = ? WHERE player_username = ?';
        } else if (data.mode === 1 && data.loggedIn === true) {
            getCurrentLevel = 'select campaign_level from players where player_username = ?';
            updateLevel = 'UPDATE players SET campaign_level = ? WHERE player_username = ?';
        } else if (data.mode === 1 && data.loggedIn === false) {
            let loadNextLevel = 'select * from blocks_table where level_id = ?';
            var level = data.level;
            pool.query(loadNextLevel, level, (err, rows) => {
                if (err) {
                    return console.error(err.message);
                } else {
                    socket.emit('loadLevelResponse', { blockData: rows });
                }
            });
            return;
        }
        pool.query(getCurrentLevel, (users.find(item => item.id === sessionID)).name, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                if (rows.length > 0) {
                    let loadNextLevel = 'select * from blocks_table where level_id = ?';
                    var level = data.mode === 2 ? rows[0].hardcore_level + 1 : rows[0].campaign_level + 1;
                    pool.query(loadNextLevel, level, (err, rows) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            socket.emit('loadLevelResponse', { blockData: rows });
                            if (rows.length > 0) {
                                pool.query(updateLevel, [level, (users.find(item => item.id === sessionID)).name], (err, rows) => {
                                    if (err) {
                                        return console.error(err.message);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });

    socket.on('loadCampaignProgress', function (data) {
        let getCurrentLevel = 'select campaign_level from players where player_username = ?';
        pool.query(getCurrentLevel, (users.find(item => item.id === sessionID)).name, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                if (rows.length > 0) {
                    let loadLevel = 'select * from blocks_table where level_id = ?';
                    var level = rows[0].campaign_level;
                    pool.query(loadLevel, level, (err, rows) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            socket.emit('loadCampaignProgressResponse', { blockData: rows, level: level });
                        }
                    });
                }
            }
        });
    });

    socket.on('startNewCampaign', function (data) {
        updateLevel = 'UPDATE players SET campaign_level = 1 WHERE player_username = ?';
        pool.query(updateLevel, (users.find(item => item.id === sessionID)).name, (err, response) => {
            if (err) {
                return console.error(err.message);
            } else {
                let loadNextLevel = 'select * from blocks_table where level_id = 1';
                pool.query(loadNextLevel, (err, rows) => {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        socket.emit('loadLevelResponse', { blockData: rows });
                    }
                });
            }
        });
    });
    socket.on('notLoggedInCampaign', function (data) {
        let loadNextLevel = 'select * from blocks_table where level_id = 1';
        pool.query(loadNextLevel, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadLevelResponse', { blockData: rows });
            }
        });
    });
    socket.on('addLevelToCampaign', function (data) {
        // let overrideCustomLevel = 'select MAX(level_id) from blocks_table';
        let saveCampaignLevel = 'insert into blocks_table(level_id, x, y, w, h, goal, invisible, ghost, deadly, bouncy, xSpeed, ySpeed, centerX, centerY, rotationalSpeed, distanceFromCenter, angle, xMin, xMax, yMin, yMax) VALUES ? ';
        addToLevel = [];
        level = [4];
        for (var i = 0; i < data.blocks_table.length; i++) {
            addToLevel.push(level.concat(data.blocks_table[i]));
        }
        pool.query(saveCampaignLevel, [addToLevel], (err, response) => {
            if (err) {
                socket.emit('saveLevelResponse', { success: false });
                return console.error(err.message);
            } else {
                socket.emit('saveLevelResponse', { success: true });
            }
        });
    });
    socket.on('getPersonalBest', function (data) {
        let getPersonalBest = 'select best_time from players where player_username = ?';
        pool.query(getPersonalBest, [(users.find(item => item.id === sessionID)).name], (err, rows, fields) => {
            if (err) {
                socket.emit('personalBestResponse', { success: false });
                return console.error(err.message);
            } else {
                socket.emit('personalBestResponse', { success: true, storedBestTime: rows[0].best_time });
            }
        });
    });
    socket.on('setBest', function (data) {
        let setPersonalBest = 'UPDATE players SET best_time = ? WHERE player_username = ?';
        pool.query(setPersonalBest, [data.time, (users.find(item => item.id === sessionID)).name], (err, response) => {
            if (err) {
                socket.emit('setBestResponse', { success: false });
                return console.error(err.message);
            } else {
                socket.emit('setBestResponse', { success: true });
            }
        });
    });

    socket.on('startHardcoreGame', function (data) {
        let updateLevel = 'UPDATE players SET hardcore_level = ? WHERE player_username = ?';
        let loadLevelOne = 'select * from blocks_table where level_id = 1';
        pool.query(loadLevelOne, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadLevelResponse', { blockData: rows });
                if (rows.length > 0) {
                    pool.query(updateLevel, [1, (users.find(item => item.id === sessionID)).name], (err, rows) => {
                        if (err) {
                            return console.error(err.message);
                        }
                    });
                }
            }
        });
    });
    socket.on('getUsername', function (data) {
        socket.emit('getUsernameResponse', { user: (users.find(item => item.id === sessionID)).name });
    });
    socket.on('loadGameLevelFromTemplate', function (data) {
        let loadLevel = 'select * from blocks_table where level_id = ?';
        pool.query(loadLevel, data.level, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadLevelFromTemplateResponse', { blockData: rows });
            }
        });
    });
    socket.on('loadCustomLevelTemplates', function (data) {
        let loadCustomTemplate = 'select * from custom_blocks_table where (username = ?) and (custom_level_name = ?)';
        pool.query(loadCustomTemplate, [(users.find(item => item.id === sessionID)).name, data.canvasId], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadCustomResponse', { blockData: rows, id: data.canvasId });
            }
        });
    });
    socket.on('loadCustomLevelNames', function (data) {
        let getCustomLevelNames = 'SELECT custom_level_name FROM custom_blocks_table where username = ? group by custom_level_name';
        pool.query(getCustomLevelNames, (users.find(item => item.id === sessionID)).name, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadCustomLevelNamesResponse', { customNames: rows });
            }
        });
    });
    socket.on('loadCustomLevelFromTemplate', function (data) {
        let getCustomLevelNames = 'SELECT * FROM custom_blocks_table where username = ? and custom_level_name = ?';
        pool.query(getCustomLevelNames, [(users.find(item => item.id === sessionID)).name, data.name], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadLevelFromTemplateResponse', { blockData: rows });
            }
        });
    });
    socket.on('loadPublicLevelNames', function (data) {
        let getPublicLevelNames = 'SELECT custom_level_name FROM custom_blocks_table where public = ? group by custom_level_name';
        pool.query(getPublicLevelNames, 0, (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('loadPublicLevelNamesResponse', { publicNames: rows });
            }
        });
    });
    socket.on('loadPublicLevelFromTemplate', function (data) {
        let getPersonalRating = 'select rating from ratings where (level_name = ?) and (player_name = ?)'
        pool.query(getPersonalRating, [data.name, (users.find(item => item.id === sessionID)).name], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                let rating = 0;
                if (rows.length > 0)
                    rating = rows[0].rating;
                let getPublicLevelFromTemplate = 'SELECT * FROM custom_blocks_table where (custom_level_name = ?) and (public = ?)';
                pool.query(getPublicLevelFromTemplate, [data.name, 0], (err, rows) => {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        socket.emit('loadLevelFromTemplateResponse', { blockData: rows, rating: rating });
                    }
                });
            }
        });
    });
    socket.on('loadPublicLevelTemplates', function (data) {
        refreshRating(data.canvasId);
    });
    socket.on('changePublicStatus', function (data) {
        let loadPublicTemplate = 'UPDATE custom_blocks_table SET public = ? WHERE (username = ?) and (custom_level_name = ?)';
        pool.query(loadPublicTemplate, [data.public, (users.find(item => item.id === sessionID)).name, data.levelName], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('changePublicStatusResponse', { publicStatus: data.public, name: data.levelName });
            }
        });
    });
    socket.on('ratingLevel', function (data) {
        let checkExistingRating = 'SELECT * from ratings where (player_name = ?) and (level_name = ?)';
        pool.query(checkExistingRating, [(users.find(item => item.id === sessionID)).name, data.levelName], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                if (rows.length > 0) {
                    let rateLevel = 'UPDATE ratings SET rating = ? WHERE (player_name = ?) and (level_name = ?)';
                    pool.query(rateLevel, [data.rating, (users.find(item => item.id === sessionID)).name, data.levelName], (err, rows) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            socket.emit('ratingLevelResponse', { success: true });
                            refreshRating(data.levelName);
                        }
                    });
                } else if ((users.find(item => item.id === sessionID)).name != '') {
                    let rateLevel = 'insert into ratings SET ?';
                    pool.query(rateLevel, { player_name: (users.find(item => item.id === sessionID)).name, level_name: data.levelName, rating: data.rating }, (err, rows) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            socket.emit('ratingLevelResponse', { success: true });
                            refreshRating(data.levelName);
                        }
                    });
                }
            }
        });
    });

    function refreshRating(levelName) {
        let rating = 0;
        let getRating = 'select rating from ratings where (level_name = ?)';
        pool.query(getRating, [levelName], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                for (let i = 0; i < rows.length; i++) {
                    rating += rows[i].rating;
                }
                if (rating > 0) {
                    rating = rating / rows.length;
                }
                let loadPublicTemplate = 'select * from custom_blocks_table where (public = ?) and (custom_level_name = ?)';
                pool.query(loadPublicTemplate, [0, levelName], (err, rows) => {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        socket.emit('loadPublicResponse', { blockData: rows, id: levelName, rating: rating });
                    }
                });
            }
        });
    }

    socket.on('deleteLevel', function (data) {
        var temination = "delete from custom_blocks_table where (username = ?) and (custom_level_name = ?)";
        pool.query(temination, [(users.find(item => item.id === sessionID)).name, data.levelName], (err, rows) => {
            if (err) {
                return console.error(err.message);
            } else {
                socket.emit('terminated', { levelName: data.levelName });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log("temination");
        socket.disconnect();
    });
});