const express = require('express')
const path = require('path')
var SpotifyWebApi = require('spotify-web-api-node');
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
var app = express();
// variables for socket.io
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(PORT, () => {
    console.log(`Express App and Socket IO server listing on PORT ${PORT}`)
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// app.get('/', (req, res) => res.render('pages/index'))
app.get('/hello', (req, res) => res.send('Hello There!'))
app.get('/test', (req, res) => res.send('test'))
// app.listen(PORT, () => console.log(`Listening on ${PORT}`))

app.get('/register', async (req, res) => {  //loads registerform
    try {
        res.render('pages/register', name);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
})
var pool = new Pool({
    ssl: true,
    //connectionString: process.env.DATABASE_URL
    connectionString: "postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
});
// var app = express();
// app.use(express.urlencoded());
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render("pages/club", { "props": { loginFailed: false } }));
app.get('/hello', (req, res) => res.send('Hello There!'));

app.get('/play', (req, res) => {
    res.render("pages/play")
})
app.get('/game', (req, res) => {
    res.render("pages/game")
})

/*  IN CASE WE WANT TO REVERT BACK TO THESE DELETE VERSIONS
 *
 *
app.get('/delete', (req, res) => res.render('pages/delete'))
app.get('/deleted', (req, res) => res.render('pages/admin'))
app.post('/deleted', (req, res) => {
    var deleteUserQuery = `DELETE FROM users WHERE username = '${req.body.username}'`;
    var deleteStatsQuery = `DELETE FROM stats WHERE username = '${req.body.username}'`;
    console.log(req.body);
    pool.query(deleteStatsQuery, (error) => {
        if (error)
            res.end(error);
    });
    pool.query(deleteUserQuery, (error) => {
        if (error)
            res.end(error);
        //res.redirect('pages/admin', results)
        var getUserQuery = `SELECT * FROM users`;
        pool.query(getUserQuery, (error, result) => {
            if (error)
                res.end(error);
            var results = { 'rows': result.rows };
            res.render('pages/admin', results)
        });
    });
});
 *
 *
 */


app.get('/delete', (req, res) => res.render('pages/delete'))
app.get('/:name/delete', (req, res) => {
    var results = {};
    results.name = req.params.name;
    res.render('pages/delete', { 'user': results });
});

app.get('/deleted', (req, res) => res.render('pages/admin'))

app.post('/:name/deleted', (req, res) => {
    let name = req.params.name;
    var deleteUserQuery = `DELETE FROM users WHERE username = '${req.body.username}'`;
    var deleteStatsQuery = `DELETE FROM stats WHERE username = '${req.body.username}'`;
    console.log(req.body);
    pool.query(deleteStatsQuery, (error) => {
        if (error)
            res.end(error);
    });
    pool.query(deleteUserQuery, (error) => {
        if (error)
            res.end(error);
        //res.redirect('pages/admin', results)
        var getUserQuery = `SELECT * FROM users`;
        pool.query(getUserQuery, (error, result) => {
            if (error)
                res.end(error);
            var results = {};
            results.users = result.rows;
            results.name = name;
            res.render('pages/admin', { 'rows': results })
            //var results = { 'rows': result.rows };
            console.log("results= ", results);
            res.render('pages/admin', { 'rows': results })
        });
    });
});

//registration and login
app.post('/club/reg', (req, res) => {        // loads new reg to database +check if username already exist
    console.log(req.body);
    let body = req.body;
    let userCheck = `SELECT * FROM users WHERE username = '${body.username}';`;
    pool.query(userCheck, (error, result) => {
        if (result.rows.length > 0) {
            res.render('pages/club', { 'props': { regFailed: true } });
            return;
        }
        var getUsersQuery = `INSERT INTO users (username , password) VALUES ('${body.username}' , '${body.password}');`;
        var getStatsQuery = `INSERT INTO stats (username , gamesplayed, gameswon, gameslost, gamesdrawn, highscore, totalpoints) VALUES ('${body.username}' , 0, 0, 0, 0, 0, 0);`;
        console.log(getUsersQuery);
        pool.query(getUsersQuery, (error, result) => {
            if (error) {
                res.send("error");
                console.log(error);
            }
        });
        console.log("passed User Query\n");
        pool.query(getStatsQuery, (error, result) => {
            if (error) {
                res.send("error");
                console.log(error);
            }
        });
        res.render("pages/club", { props: { 'login': true } });
    });
})

app.get("/club", (req, res) => {
    res.render("pages/club", { "props": { loginFailed: false } })
})



app.post("/club/login", (req, res) => {
    console.log(req.body);
    var queryString = `SELECT * FROM users WHERE username='${req.body.username}';`;
    pool.query(queryString, (error, result) => {
        if (error)
            res.send(error);
        if (result.rows.length > 0 && result.rows[0].password === req.body.password) {
            if (result.rows[0].type === "admin") {
                var getUserQuery = `SELECT * FROM users`;
                pool.query(getUserQuery, (error, result) => {
                    if (error)
                        res.end(error);
                    var results = {};
                    results.users = result.rows;
                    results.name = req.body.username;
                    console.log(results);
                    res.render('pages/admin', { 'rows': results })  // load admin page for admins
                })
                return;
            } else {
                res.render("pages/play", { 'props': { username: req.body.username } });    // load user page for users
                return;
            }
        }
        res.render('pages/club', { 'props': { loginFailed: true } });
    })

})

app.get("/club/:name/stats", (req, res) => {
    let name = req.params.name;
    let loadStats = `SELECT * FROM stats WHERE username = '${name}';`;
    let loadRank = `SELECT username, RANK() OVER(ORDER BY highscore DESC) from stats;`;
    let results = {};
    pool.query(loadStats, (error, result) => {
        if (error) {
            res.send("error");
            console.log(error);
        }
        results.stats = result.rows[0];
        pool.query(loadRank, (error, result) => {
            if (error) {
                res.send("error");
                console.log(error);
            }
            console.log(result);
            findrank = (result) ? result.rows : null;
            findrank.forEach(function (user) {
                if (user.username == name) {
                    results.rank = user.rank;
                }
            });
            // console.log("rank of " + name + " :" + results.rank);
            //results.rank = result.rows[0].rank;
            if (results.rank == 1) {
                results.color = "#D4AF37";
            }
            else if (results.rank == 2) {
                results.color = "#C0C0C0";
            }
            else if (results.rank == 3) {
                results.color = "#cd7f32";
            }
            else {
                results.color = "white";
            }
            //console.log("color= ", results.color);
            res.render('pages/stats', { 'rows': results });
        });
    });

});

app.get("/club/:name/leaderboard", (req, res) => {
    var name = req.params.name;
    let loadLeaderboard = `SELECT username, highscore, RANK() OVER (ORDER BY highscore DESC) FROM stats limit 10;`;
    let results = {};
    var player;
    pool.query(loadLeaderboard, (error, result) => {
        if (error) {
            res.send(error);
            console.log(error);
        }
        var foundplayer = false;
        var leaderboard = (result) ? result.rows : null;
        leaderboard.forEach(function (user) {
            if (user.username == name) {
                foundplayer = true;
                player = user;
            }
        });
        results.topten = leaderboard;
        if (foundplayer == true) {
            results.player = player;
            console.log(results);
            res.render('pages/leaderboard', { 'rows': results });
        }
        else {
            let findplayer = `SELECT username, highscore, RANK() OVER (ORDER BY highscore DESC) FROM stats offset 10;`;
            pool.query(findplayer, (error, result) => {
                if (error) {
                    res.send(error);
                    console.log(error);
                }
                var lookforplayer = (result) ? result.rows : null;
                console.log("look for player:\n", lookforplayer);
                lookforplayer.forEach(function (user) {
                    if (user.username == name) {
                        player = user;
                    }
                });
                results.player = player;
                console.log(results);
                res.render('pages/leaderboard', { 'rows': results })
            });
        }
    });
});

app.get("/club/admin/:name/leaderboard", (req, res) => {
    var name = req.params.name;
    let loadLeaderboard = `SELECT *, RANK() OVER (ORDER BY highscore DESC) FROM stats;`;
    pool.query(loadLeaderboard, (error, result) => {
        if (error) {
            res.send(error);
            console.log(error);
        }
        //var results = { 'rows': result.rows };
        var results = {};
        results.player = name;
        results.board = result.rows;
        console.log(results.board);
        res.render('pages/adminleaderboard', { 'rows': results });
    })
});

app.get('/music-client', function (req, res) {
    res.render('pages/music-client');
});

app.get('/music', (req, res) => {
    res.render('pages/music');
})

app.post('/testPost', (req, res) => {
    console.log(req.body)
})

app.post('/playing', (req, res) => {
    var token = req.body.tokenName;
    var spotifyApi = new SpotifyWebApi({
        clientId: '76399d6d66784fbd9b089a5363553e47',
        clientSecret: '5d6ec7245f5a4902af2f5b40c6315a63',
        // redirectUri: 'http://localhost:5000/music'
    });
    spotifyApi.setAccessToken(token);
    spotifyApi.getMyCurrentPlaybackState({
    })
        .then(function (data) {
            // Output items
            //console.log("Now Playing: ",data.body.item.artists[0].name);
            //console.log("Now Playing: ",data.body.item.name);
            var queryData = {}
            var trackURI = data.body.item.uri;
            var trackURIFormatted = trackURI.replace('spotify:track:', '')
            // console.log(trackURIFormatted)
            queryData.artist = data.body.item.artists[0].name + '';
            queryData.name = data.body.item.name + '';
            queryData.uri = trackURIFormatted + '';
            queryData.accessToken = token + '';
            /* Get Audio Analysis for a Track */
            spotifyApi.getAudioAnalysisForTrack(queryData.uri)
                .then(function (data) {
                    // console.log(data.body.track.duration);
                    // console.log(data.body.track.tempo);
                    queryData.duration = data.body.track.duration;
                    queryData.tempo = data.body.track.tempo;
                    // res.send(queryData)

                    // res.render('pages/playing', queryData)
                    res.render('pages/game', queryData)
                }, function (err) {
                    // done(err);
                    console.log(err)
                });
            // console.log(queryData)
            // res.send(queryData)
            // res.render('pages/playing', queryData)
        }, function (err) {
            console.log('Something went wrong!', err);
        });
})

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '76399d6d66784fbd9b089a5363553e47'; // 'CLIENT_ID'; // Your client id
var client_secret = '5d6ec7245f5a4902af2f5b40c6315a63'; // 'CLIENT_SECRET'; // Your secret
// var redirect_uri =  'http://localhost:8888/callback'; // 'REDIRECT_URI'; // Your redirect uri
//var redirect_uri =  'http://localhost:5000/callback'; // 'REDIRECT_URI'; // Your redirect uri
// var redirect_uri =  'https://server-simulator.herokuapp.com/callback'; // 'REDIRECT_URI'; // Your redirect uri
var redirect_uri = 'http://sleepy-lake-49832.herokuapp.com/callback';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

// var app = express();

app.use(express.static(__dirname + '/public'))
app.use(cors())
app.use(cookieParser());

app.get('/spotify-login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    // var scope = 'user-read-private user-read-email';
    var scope = 'user-read-private user-read-email user-read-playback-state';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

app.get('/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function (error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there

                // res.redirect('/#' +
                // res.redirect('http://localhost:5000/music/#' +
                res.redirect('./music/#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});

app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

// app.get('/playing', (req,res) => {

//     var spotifyApi = new SpotifyWebApi({
//         clientId: '76399d6d66784fbd9b089a5363553e47',
//         clientSecret: '5d6ec7245f5a4902af2f5b40c6315a63',
//         redirectUri: 'http://localhost:5000/music'
//     });
//     spotifyApi.setAccessToken('');
//     spotifyApi.getMyCurrentPlaybackState({
//     })
//     .then(function(data) {
//         // Output items
//         //console.log("Now Playing: ",data.body.item.artists[0].name);
//         //console.log("Now Playing: ",data.body.item.name);
//         var queryData = {}
//         var trackURI = data.body.item.uri;
//         var trackURIFormatted = trackURI.replace('spotify:track:', '')
//         // console.log(trackURIFormatted)
//         queryData.artist = data.body.item.artists[0].name + '';
//         queryData.name = data.body.item.name + '';
//         queryData.uri = trackURIFormatted + '';
//         /* Get Audio Analysis for a Track */
//         spotifyApi.getAudioAnalysisForTrack(queryData.uri)
//         .then(function(data) {
//             // console.log(data.body.track.duration);
//             // console.log(data.body.track.tempo);
//             queryData.duration = data.body.track.duration;
//             queryData.tempo = data.body.track.tempo;
//             // res.send(queryData)
//             res.render('pages/playing', queryData)
//         }, function(err) {
//             // done(err);
//             console.log(err)
//         });
//         // console.log(queryData)
//         // res.send(queryData)
//         // res.render('pages/playing', queryData)
//     }, function(err) {
//     console.log('Something went wrong!', err);
//     });

// })


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// // credentials are optional
// var spotifyApi = new SpotifyWebApi({
//     clientId: '76399d6d66784fbd9b089a5363553e47',
//     clientSecret: '5d6ec7245f5a4902af2f5b40c6315a63',
//     redirectUri: 'http://localhost:5000/song'
// });

// spotifyApi.setAccessToken('BQCzo9rOobdKvKENECnSt6sFkRMtKTihqhaUbfheNP20-_es92VBypTvteHfI1_0srQpOwcHoXvPH0g_HKqXhZofxMAuV12XI5no64MtspL2kVFt5W_opkXB-xKWY9pTMthQ2og62Jw6l3T1w-b5HRqYGsVMnwyIKeM4iGfd_nFwC2yhs5J2ax-eAg');

// spotifyApi.getMyCurrentPlaybackState({
// })
// .then(function(data) {
//   // Output items
// //   console.log("Now Playing: ",data.body);
//   console.log("Now Playing: ",data.body.item.artists[0].name);
//   console.log("Now Playing: ",data.body.item.name);
// //   console.log("Now Playing: ",data.body.item.uri);
//   var trackURI = data.body.item.uri;
//   var trackURIFormatted = trackURI.replace('spotify:track:', '')
//   console.log(trackURIFormatted)
// //   console.log("Now Playing: ",data.body.name);
// //   console.log("Now Playing: ",data.body.artists);
// }, function(err) {
//   console.log('Something went wrong!', err);
// });

// /* Get Audio Analysis for a Track */
// spotifyApi.getAudioAnalysisForTrack('0rKtyWc8bvkriBthvHKY8d')
//   .then(function(data) {
//     console.log(data.body.track.duration);
//     console.log(data.body.track.tempo);
//   }, function(err) {
//     done(err);
// });

// spotifyApi.getTrack('0rKtyWc8bvkriBthvHKY8d')
//   .then(function(data) {
//     console.log(data.body.name);
//     console.log(data.body.artists[0].name);
//   }, function(err) {
//     done(err);
// });

/* Get Audio Analysis for a Track */

// spotifyApi.getAudioAnalysisForTrack(trackURIFormatted)
//   .then(function(data) {
//     console.log(data.body.track.duration);
//     console.log(data.body.track.tempo);
//   }, function(err) {
//     done(err);
// });

// spotifyApi.getTrack(trackURIFormatted)
//   .then(function(data) {
//     console.log(data.body.name);
//     console.log(data.body.artists[0].name);
//   }, function(err) {
//     done(err);
// });
app.get("/club/:name/home", (req, res) => {
    var name = req.params.name;
    var queryString = `SELECT * FROM users WHERE username='${name}';`;
    pool.query(queryString, (error, result) => {
        if (error)
            res.send(error);
        if (result.rows.length > 0) {
            if (result.rows[0].type === "admin") {
                var getUserQuery = `SELECT * FROM users`;
                pool.query(getUserQuery, (error, result) => {
                    if (error)
                        res.end(error);
                    var results = { 'rows': result.rows };
                    res.render('pages/admin', results)  // load admin page for admins
                })
                return;
            }
            else {
                res.render("pages/play", { 'props': { username: name } });    // load user page for users
                return;
            }
        }
        res.render('pages/club', { 'props': { loginFailed: true } });
    });
});

app.get("/club/admin/:name/stats", (req, res) => {
    let name = req.params.name;
    let loadStats = `SELECT * FROM stats WHERE username = '${name}';`;
    let loadRank = `SELECT username, RANK() OVER(ORDER BY highscore DESC) from stats;`;
    let results = {};
    pool.query(loadStats, (error, result) => {
        if (error) {
            res.send("error");
            console.log(error);
        }
        results.stats = result.rows[0];
        pool.query(loadRank, (error, result) => {
            if (error) {
                res.send("error");
                console.log(error);
            }
            // console.log(result);
            findrank = (result) ? result.rows : null;
            findrank.forEach(function (user) {
                if (user.username == name) {
                    results.rank = user.rank;
                }
            });
            // console.log("rank of " + name + " :" + results.rank);
            //results.rank = result.rows[0].rank;
            if (results.rank == 1) {
                results.color = "#D4AF37";
            }
            else if (results.rank == 2) {
                results.color = "#C0C0C0";
            }
            else if (results.rank == 3) {
                results.color = "#cd7f32";
            }
            else {
                results.color = "white";
            }
            //console.log("color= ", results.color);
            res.render('pages/stats_admin', { 'rows': results });
        });
    });

});

app.get("/club/admin/:name/home", (req, res) => {
    console.log("in!");
    let name = req.params.name;
    var getUserQuery = `SELECT * FROM users`;
    pool.query(getUserQuery, (error, result) => {
        if (error)
            res.end(error);
        var results = {};
        results.users = result.rows;
        results.name = name;
        res.render('pages/admin', { 'rows': results })  // load admin page for admins
    })
});


// creating and joining rooms

app.get('/club/:name/lobby', (req, res) => {
    res.render('pages/lobby', { rooms: rooms, props: { username: req.params.name } })
})
const rooms = { name: {} }
const users = {}
app.post('/room', (req, res) => {

    if (rooms[req.body.room] != null) {
        return res.redirect('pages/lobby')
    }
    rooms[req.body.room] = { users: {} }
    res.redirect(req.body.room)
    io.emit('room-created', req.body.room)
})
app.get('/:room', (req, res) => {
    io.emit('user-joined', "hello")
    res.render('pages/room', { roomName: req.params.room, users: users })
})

// app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//})

//sockets
var playerCount = 0;
var players = {};

io.sockets.on('connection', function (socket) {
    console.log('a user has now connected');
    io.sockets.emit('numPlayers', playerCount);
    // create a new player and add it to the players object
    players[socket.id] = {
        //add position
        colour: "blue",
        playerId: socket.id,
        username: socket.username,
    }
    io.on('updateColour', function (colourData) {
        players[socket.id].colour = colourData.colour;
        socket.broadcast.emit('updateSprite', players[socket.id]);
    });

    //send players object to new player
    io.emit('currentPlayers', players);

    //update all other players of new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
});

//disconnect

io.on('disconnect', function () {
    playerCount--;
    console.log('user disconnected');
    delete players[socket.id];
    io.emit('disconnect', socket.id);
});
app.get('/club/:name/lobby', (req, res) => {
    res.render('pages/lobby', { rooms: rooms, props: { username: req.params.name } })
})


io.on('message', function (data) {
    console.log("catched")
    console.log(data);
    io.emit('message', data);
})
io.on('disconnect', function () {
    io.sockets.emit('numPlayers', playerCount);
    io.emit('disconnect');
});