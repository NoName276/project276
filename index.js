const express = require('express')
const path = require('path')
var SpotifyWebApi = require('spotify-web-api-node');
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
var app = express();
// variables for socket.io
var server = require('http').createServer(app);
var io = require('socket.io')(server);
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

module.exports = server;

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
  connectionString: process.env.DATABASE_URL
  // connectionString: "postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
});
app.get('/', (req, res) => res.render("pages/club", { "props": { loginFailed: false } }));
app.get('/hello', (req, res) => res.send('Hello There!'));

app.get('/play', (req, res) => {
  res.render("pages/play")
})
// app.get('/game', (req,res) => {
//   res.render("pages/game")
// })

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
    pool.query(deleteStatsQuery, (error) => {
        if (error)
            res.end(error);
    });
    pool.query(deleteUserQuery, (error) => {
        if (error)
            res.end(error);
        var getUserQuery = `SELECT * FROM users`;
        pool.query(getUserQuery, (error, result) => {
            if (error)
                res.end(error);
            var results = {};
            results.users = result.rows;
            results.name = name;
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
  //console.log(req.body);
    var queryString = `SELECT * FROM users WHERE username='${req.body.username}';`;
    pool.query(queryString, (error, result) => {
        if(error)
            res.send(error);
        if(result.rows.length > 0 && result.rows[0].password === req.body.password){
            if(result.rows[0].type === "admin"){
              var getUserQuery = `SELECT * FROM users`;
              pool.query(getUserQuery, (error, result) => {
                if (error)
                      res.end(error);
                  var results = {};
                  results.users = result.rows;
                  results.name = req.body.username;
                  //console.log(results);
                  res.render('pages/admin', { 'rows': results })  // load admin page for admins
              })
              return;
            }else{
              res.render("pages/play", {'props': {username: req.body.username}});    // load user page for users
              return;
            }
        }
        res.render('pages/club', {'props': {loginFailed: true}});
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
        results.topten = leaderboard;
        if (foundplayer == true) {
            results.player = player;
            //console.log(results);
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
                console.log("look for player:\n" , lookforplayer);
                lookforplayer.forEach(function (user) {
                    if (user.username == name) {
                        player = user;
                    }
                });
                results.player = player;
                //console.log(results);
                res.render('pages/leaderboard', { 'rows': results })
            });
        }
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
        //console.log(results.board);
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

app.post('/playing', (req,res) => {
    var token = req.body.tokenName;
    var spotifyApi = new SpotifyWebApi({
        clientId: '76399d6d66784fbd9b089a5363553e47',
        clientSecret: '5d6ec7245f5a4902af2f5b40c6315a63',
        // redirectUri: 'http://localhost:5000/music'
    });
    spotifyApi.setAccessToken(token);
    spotifyApi.getMyCurrentPlaybackState({
    })
    .then(function(data) {
        // Output items
        console.log(data.body.is_playing)
        if (data.body.is_playing == false) {
            res.redirect(`/music`)
            res.end('Play a song before playing!');
        } else {
            var queryData = {}
            var trackURI = data.body.item.uri;
            var trackURIFormatted = trackURI.replace('spotify:track:', '')
            queryData.artist = data.body.item.artists[0].name + '';
            queryData.name = data.body.item.name + '';
            queryData.uri = trackURIFormatted + '';
            queryData.accessToken = token + '';
            queryData.playerNumber = 0;
            queryData.numberOfPlayers = 1;
            queryData.username = undefined;
            queryData.singlePlayer = true;
            queryData.room = undefined;
            queryData.enemiesStart = [
              Math.floor(Math.random()* 4) + 2,
              Math.floor(Math.random()* 10),
              Math.floor(Math.random()* 4) + 2,
              Math.floor(Math.random()* 10),
              Math.floor(Math.random()*7)+2,
              Math.floor(Math.random()*1)+7,
            ]
            /* Get Audio Analysis for a Track */
            spotifyApi.getAudioAnalysisForTrack(queryData.uri)
            .then(function(data) {
                // console.log(data)
                // console.log(data.body.track.duration);
                // console.log(data.body.track.tempo);
                queryData.duration = data.body.track.duration;
                queryData.tempo = data.body.track.tempo;
                // res.send(queryData)
                queryData.track = "silence"
                // res.render('pages/playing', queryData)
            res.render('pages/game', queryData)
            }, function(err) {
                // done(err);
                console.log(err)
            });
        }
    }, function(err) {
    console.log('Something went wrong!', err);
    });
})

app.get('/joji', (req, res) => {
    res.render('pages/slow-dancing-in-the-dark');
})
app.get('/slow-dancing-in-the-dark.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/slow-dancing-in-the-dark.mp3')
})
app.get('/hadestown', (req, res) => {
    res.render('pages/way-down-hadestown-ii');
})
app.get('/hadestown-original-broadway-cast-way-down-hadestown-ii-lyrics.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/hadestown-original-broadway-cast-way-down-hadestown-ii-lyrics.mp3')
})
app.get('/dear-evan-hansen', (req, res) => {
    res.render('pages/waving-through-a-window');
})
app.get('/waving-through-a-window-from-the-dear-evan-hansen-original-broadway-cast-recording.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/waving-through-a-window-from-the-dear-evan-hansen-original-broadway-cast-recording.mp3')
})
app.get('/88rising', (req, res) => {
    res.render('pages/breathe');
})
app.get('/breathe.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/breathe.mp3')
})
app.get('/billie-eilish', (req, res) => {
    res.render('pages/bad-guy');
})
app.get('/bad-guy.mp3', (req, res) => {
    console.log("loading badguy");
    res.sendFile(__dirname + '/audio/bad-guy.mp3')
})
app.get('/dua-lipa', (req, res) => {
    res.render('pages/dont-start-now');
})
app.get('/dont-start-now.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/dont-start-now.mp3')
})
app.get('/sam-smith', (req, res) => {
    res.render('pages/how-do-you-sleep');
})
app.get('/how-do-you-sleep.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/how-do-you-sleep.mp3')
})
app.get('/ali-gatie', (req, res) => {
    res.render('pages/its-you');
})
app.get('/its-you.mp3', (req, res) => {
    res.sendFile(__dirname + '/audio/its-you.mp3')
})


var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '76399d6d66784fbd9b089a5363553e47'; // 'CLIENT_ID'; // Your client id
var client_secret = '5d6ec7245f5a4902af2f5b40c6315a63'; // 'CLIENT_SECRET'; // Your secret


// var redirect_uri =  'http://localhost:5000/callback'; // 'REDIRECT_URI'; // Your redirect uri
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
  var scope = 'user-read-private user-read-email user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: `${redirect_uri}`,
      state: state
    }));
});

app.get('/callback', function (req, res) {

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
        console.log(body.access_token);
        console.log('\n')
        console.log(body.refresh_token);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          console.log(body);
        });

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
            res.redirect(`/club/admin/${name}/home`);  // load admin page for admins
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
   // console.log("in!");
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

app.get("/club/admin/:name/toggleadmin", (req, res) => {
    let name = req.params.name;
    var getAdminsQuery = `SELECT * FROM users where type= 'admin';`;
    var getNormsQuery = `select * from users where type <> 'admin' OR type IS NULL;`;
    var results = {};
    pool.query(getAdminsQuery, (error, result) => {
        if (error)
            res.end(error);
        results.admins = result.rows;
        pool.query(getNormsQuery, (error, result) => {
            if (error) {
                res.end(error);
            }
            results.norms = result.rows;
            results.name = name;
            res.render('pages/admintoggle', { 'rows': results });
        })
    })
});

app.post("/club/admin/:name/toggleadmin", (req, res) => {
    let name = req.params.name;
    let toBeToggled = req.body.toggleduser;
    //console.log("toggling user: ", toBeToggled);
    var results = {};
    if (name != toBeToggled) {
        var getToggledQuery = `SELECT username, type FROM users where username= '${toBeToggled}';`;
        //console.log(getToggledQuery);
        pool.query(getToggledQuery, (error, result) => {
            if (error)
                res.send(error);
            if (result.rows.length > 0) {
                if (result.rows[0].type === 'admin') {
                    var Toggling = `UPDATE users SET type= NULL where username= '${toBeToggled}';`;
                }
                else {
                    var Toggling = `UPDATE users SET type= 'admin' where username= '${toBeToggled}';`;
                }
               // console.log("set toggle to: " + Toggling);
                pool.query(Toggling, (error, result) => {
                    if (error)
                        res.send(error);
                    else {
                        results.goodtoggle = true;
                       // console.log("good toggle\n");
                    }
                    var getAdminsQuery = `SELECT * FROM users where type = 'admin';`;
                    var getNormsQuery = `SELECT * from users where type IS NULL;`;
                    pool.query(getAdminsQuery, (error, result) => {
                       // console.log("start loading table\n")
                        if (error)
                            res.end(error);
                        //console.log(result.rows);
                        results.admins = result.rows;
                        pool.query(getNormsQuery, (error, result) => {
                            if (error) {
                                res.end(error);
                            }
                           // console.log(result.rows);
                            results.norms = result.rows;
                            results.name = name;
                            res.render('pages/admintoggle', { 'rows': results });
                        });
                    });
                });
            }
            else {
                results.notexist = true;
                var getAdminsQuery = `SELECT * FROM users where type = 'admin';`;
                var getNormsQuery = `SELECT * from users where type IS NULL;`;
                pool.query(getAdminsQuery, (error, result) => {
                    //console.log("start loading table (else1)\n")
                    if (error)
                        res.end(error);
                   // console.log(result.rows);
                    results.admins = result.rows;
                    pool.query(getNormsQuery, (error, result) => {
                        if (error) {
                            res.end(error);
                        }
                       // console.log(result.rows);
                        results.norms = result.rows;
                        results.name = name;
                        res.render('pages/admintoggle', { 'rows': results });
                    });
                });

            }
        })
    }
    else {
        results.selfchange = true;
        var getAdminsQuery = `SELECT * FROM users where type = 'admin';`;
        var getNormsQuery = `SELECT * from users where type IS NULL;`;
        pool.query(getAdminsQuery, (error, result) => {
           // console.log("start loading table (else2)\n")
            if (error)
                res.end(error);
            //console.log(result.rows);
            results.admins = result.rows;
            pool.query(getNormsQuery, (error, result) => {
                if (error) {
                    res.end(error);
                }
               // console.log(result.rows);
                results.norms = result.rows;
                results.name = name;
                res.render('pages/admintoggle', { 'rows': results });
            });
        });

    }

});

app.get('/club/admin/:name/songselect', (req, res) => {
    let name = req.params.name;
    console.log("in song select")
    res.render('pages/selectsongs', { 'name': name });

});

// creating and joining rooms

const rooms = {
  name: []
}
const roomsOpen = {
  name: true
}
const users = {}
app.get('/club/:name/lobby', (req, res) => {
  res.render('pages/lobby', { rooms, username: req.params.name })
})
app.post('/room', (req, res) => {
  const {room, username} = req.body
  if (rooms[room] != null) {
    return res.redirect('pages/lobby')
  }
  rooms[room] = []
  roomsOpen[room] = true
  console.log(`creating new room ${room}`)
  io.of('lobby').emit('room-created', room)
  res.redirect(`/room/${room}/${username}`)
})

app.get('/room/:room/:username', (req, res) => {
  const {room, username} = req.params
  if(rooms[room].indexOf(username) != -1){
    rooms[room].splice(rooms[room].indexOf(username), 1)
  }
  console.log(`${room} : ${roomsOpen[room]}`)
  if(roomsOpen[room] && rooms[room].length < 4){
    res.render('pages/room', { roomName: room, users: rooms[room], username })
  }else if(roomsOpen[room]){
    res.render('pages/lobby', {rooms, username, error: `room '${room}' is full`})
  }else{
    res.render('pages/lobby', {rooms, username, error: `room '${room}' is currently in-game`})
  }
})
let enemiesStart = [
  Math.floor(Math.random()* 4) + 2,
  Math.floor(Math.random()* 10),
  Math.floor(Math.random()* 4) + 2,
  Math.floor(Math.random()* 10),
  Math.floor(Math.random()*7)+2,
  Math.floor(Math.random()*1)+7,
]
app.get('/club/:room/:username/game/:playerNum', (req, res) => {
  console.log(enemiesStart)
  let {song} = req.query
  var durationDict = {
  "slow-dancing-in-the-dark": 209,
  "breathe": 126,
  "bad-guy": 194,
  "dont-start-now": 183,
  "how-do-you-sleep": 202,
  "its-you": 214,
  "dear-evan-hansen": 236,
  "hadestown": 230

  }
  var tempoDict = {
    "slow-dancing-in-the-dark": 89,
    "breathe": 113,
    "bad-guy": 135,
    "dont-start-now": 124,
    "how-do-you-sleep": 111,
    "its-you": 96,
    "dear-evan-hansen": 144,
    "hadestown": 120
  }
  var artistDict = {
    "slow-dancing-in-the-dark": "Joji",
    "breathe": "88rising, Joji, Don Krez",
    "bad-guy": "Billie Eilish",
    "dont-start-now": "Dua Lipa",
    "how-do-you-sleep": "Sam Smith",
    "its-you": "Ali Gatie",
    "dear-evan-hansen": "DEAR EVAN HANSEN Original Broadway Cast",
    "hadestown": "Hadestown Original Broadway Cast"
  }
  var nameDict = {
    "slow-dancing-in-the-dark": "SLOW DANCING IN THE DARK",
    "breathe": "Breathe",
    "bad-guy": "bad guy",
    "dont-start-now": "Don't Start Now",
    "how-do-you-sleep": "How Do You Sleep?",
    "its-you": "It's You",
    "dear-evan-hansen": "Waving Through a Window",
    "hadestown": "Way down Hadestown II"
  }
  var uriDict = {
    "slow-dancing-in-the-dark": "0rKtyWc8bvkriBthvHKY8d",
    "breathe": "72hSRAHg4hXE5ApwSQQZPn",
    "bad-guy": "2Fxmhks0bxGSBdJ92vM42m",
    "dont-start-now": "6WrI0LAC5M1Rw2MnX2ZvEg",
    "how-do-you-sleep": "spotify:track:6b2RcmUt1g9N9mQ3CbjX2Y",
    "its-you": "5DqdesEfbRyOlSS3Tf6c29",
    "dear-evan-hansen": "2GlsXuQV0YOOwPy3XKFIS9",
    "hadestown": "1FomWvYH5RqagHVHYj9OfC"
  }
  const {room, username, playerNum} = req.params
  res.render('pages/game', {
    duration: durationDict[song],
    playerNumber: playerNum,
    numberOfPlayers: rooms[room].length,
    username,
    uri: uriDict[song],
    name: nameDict[song],
    artist: artistDict[song],
    tempo: tempoDict[song],
    enemiesStart,
    accessToken: 0,
    track: song,
    room,
    singlePlayer: false
  })
})

app.post('/club/:name/updatingstats', (req, res) => {
    console.log("post");
    var name = req.params.name;
    var playerscore = req.body.scorenum;
    console.log(playerscore);
    let updatehighscore = `SELECT highscore FROM stats WHERE username = '${name}';`;
    //let updateGameStatus = `UPDATE STATS set gamesplayed= gamesplayed+1, totalpoints= totalpoints+${playerscore} WHERE username = '${name}';`;
    console.log(updatehighscore);
    //console.log(updateGameStatus);
    pool.query(updatehighscore, (error, result) => {
        if (error) {
            res.end(error);
        }
        var oldhighscore = result.rows[0].highscore;
        console.log(oldhighscore);
        var newhighscore = (oldhighscore >= playerscore ? oldhighscore : playerscore);
        let updateGameStatus = `UPDATE STATS set gamesplayed= gamesplayed+1, totalpoints= totalpoints+${playerscore}, highscore=${newhighscore} WHERE username = '${name}';`;
        console.log(updateGameStatus);
        pool.query(updateGameStatus, (error, result) => {
            if (error) {
                res.end(error);
            }
            var updateWinLoseDraw
            if (playerscore > 200) {
                updateWinLoseDraw = `UPDATE STATS set gameswon= gameswon+1 WHERE username = '${name}';`;
            }
            else if (playerscore <= 200 && playerscore >= 190) {
                updateWinLoseDraw = `UPDATE STATS set gamesdrawn= gamesdrawn+1 WHERE username = '${name}';`;
            }
            else {
                updateWinLoseDraw = `UPDATE STATS set gameslost= gameslost+1 WHERE username = '${name}';`;
            }
            pool.query(updateWinLoseDraw, (error, result) => {
                if (error) {
                    res.end(error);
                }

                res.redirect(`/club/${name}/lobby`);

            });
        });
    });
});


app.get('/club/:name/:score/gameres', (req, res) => {
   let name = req.params.name;
    var score = req.params.score;
    let scores = JSON.parse(decodeURIComponent(req.query.scores));
    res.render("pages/gameres", { name: name, score: score, allPlayerScores: scores });
});
/*app.get('/club/:name/updatingstats', (req, res) => {
    console.log("get");
    var name = req.params.name;
    var playerscore = req.body.scorenum;
    console.log(playerscore);
    let updateStatsofUser = `SELECT * FROM stats WHERE username = '${name}';`;
    let updateGameStatus = `UPDATE STATS set gamesplayed= gamesplayed+1, totalpoints= totalpoints+${playerscore} whereHERE username = '${name}';`;
    console.log(updateStatsofUser);
    console.log(updateGameStatus);
    res.redirect(`/club/${name}/home`);
});*/


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
  res.statusCode = 404;
  res.render('pages/404');
});

//sockets
io.of('chat').on('connection', socket => {

  socket.on('join', ({roomName: room, username}) => {
    console.log(`user '${username}' joining room '${room}'`)
    rooms[room].push(username)
    console.log(`members of '${room}': ${rooms[room]}`)
    socket.join(room)
    io.of('chat').to(room).emit('userJoined', username)
  })

  socket.on('leave', ({roomName: room, username}) => {
    console.log(`user '${username}' leaving room '${room}'`)
    if(rooms[room] != undefined && rooms[room].indexOf(username) != -1){
      rooms[room].splice(rooms[room].indexOf(username), 1)
    }
    console.log(`members of '${room}': ${rooms[room]}`)
    socket.leave(room)
    io.of('chat').to(room).emit('userLeft', username)
  })

  socket.on('message', (data) => {
    const { message, room, username } = data;
    console.log(`new message - ${room}:\n\t${username}: ${message}`)
    io.of('chat').to(room).emit('newMessage', {username, message})
  })

  socket.on('startGame', ({roomName: room, song}) => {
    roomsOpen[room] = false
    enemiesStart = [
      Math.floor(Math.random()* 4) + 2,
      Math.floor(Math.random()* 10),
      Math.floor(Math.random()* 4) + 2,
      Math.floor(Math.random()* 10),
      Math.floor(Math.random()*7)+2,
      Math.floor(Math.random()*1)+7,
    ]
    io.of('chat').to(room).emit('launchGame', {members: rooms[room], song})
  })

})

io.of("lobby").on('connection', socket => {
  console.log("player joined lobby")
  socket.on('disconnect', () => {
    console.log('player leaving lobby')
  } )
})

const playerCount = {
  name: 0
}
io.of('game').on('connection', socket => {
  socket.on("join", (room) => {
    if (playerCount[room] != undefined){
      playerCount[room]++
    }else{
      playerCount[room] = 1
    }
    console.log(`user joining ${room}, count: ${playerCount[room]}`)
    socket.join(room)
  })
  socket.on("leave", (room) => {
    if (playerCount[room]){
      playerCount[room]--
      if (playerCount[room] <= 0){
        roomsOpen[room] = true
        playerCount[room] = 0
      }
    }
    console.log(`user leaving ${room}, count: ${playerCount[room]}`)
    socket.leave(room)
  })
socket.on("newScore", ({data, room}) => {
  console.log(`${room}: ${JSON.stringify(data)}`)
  io.of("game").to(room).emit("updateScore", data)
  })
  socket.on("newPos", ({data, room}) => {
    console.log(`${room}: ${JSON.stringify(data)}`)
    io.of('game').to(room).emit('updatePos', data)
  })
  socket.on("newEnemies", ({data, room}) => {
    console.log(`${room}: new enemies - ${data}`)
    io.of('game').to(room).emit('updateEnemies', data)
  })
  socket.on("newBpm", ({data, room}) => {
    console.log(`${room}: newBpm - ${data}`)
    io.of('game').to(room).emit('updateBpm', data)
  })
  socket.on("newGlasses", ({data, room}) => {
    console.log(`${room}: ${JSON.stringify(data)}`)
    io.of('game').to(room).emit('updateGlasses', data)
    })
    socket.on("getScores", ({ data, room }) => {
        io.of('game').to(room).emit('updateScores', data)
    })
})



io.of('results').on('connection', socket => {
    socket.on('player', (data) => {
        const { player, name, score } = data;
        console.log(`new player - ${room}:\n\t${name}: ${score}`)
        io.of('chat').to(room).emit('enterPlayer', { name, score })
    })

})

