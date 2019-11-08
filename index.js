const express = require('express')
const path = require('path')
var SpotifyWebApi = require('spotify-web-api-node');
const PORT = process.env.PORT || 5000

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/hello', (req, res) => res.send('Hello There!'))
app.get('/test', (req, res) => res.send('test'))
app.listen(PORT, () => console.log(`Listening on ${PORT}`))

app.get('/register', async (req, res) => {  //loads registerform
    try {
        res.render('pages/register', name);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/login', async (req, res) => {     //loads loginform
    try {
        res.render('pages/login', name);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/:user/login', async (req, res) => {   //puts info into databse and loads home
        //  TODO
    try {
        res.render('pages/login', name);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/:user/register', async (req, res) => {    //checks if person in databse with same password, home if does, error if not right password
        // TODO
    try {
        res.render('pages/login', name);
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

app.get('/music-client', function (req, res) {
    res.render('pages/music-client');
});

app.get('/music', (req,res) => {
    res.render('pages/music');
})

app.post('/testPost', (req,res) => {
    console.log(req.body)
})

app.post('/playing', (req,res) => {
    var token = req.body.tokenName;
    var spotifyApi = new SpotifyWebApi({
        clientId: '76399d6d66784fbd9b089a5363553e47',
        clientSecret: '5d6ec7245f5a4902af2f5b40c6315a63',
        redirectUri: 'http://localhost:5000/music'
    });
    spotifyApi.setAccessToken(token);
    spotifyApi.getMyCurrentPlaybackState({
    })
    .then(function(data) {
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
        .then(function(data) {
            // console.log(data.body.track.duration);
            // console.log(data.body.track.tempo);
            queryData.duration = data.body.track.duration;
            queryData.tempo = data.body.track.tempo;
            // res.send(queryData)
            res.render('pages/playing', queryData)
        }, function(err) {
            // done(err);
            console.log(err)
        });
        // console.log(queryData)
        // res.send(queryData)
        // res.render('pages/playing', queryData)
    }, function(err) {
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
var redirect_uri =  'http://localhost:5000/callback'; // 'REDIRECT_URI'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
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

app.get('/spotify-login', function(req, res) {

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

app.get('/callback', function(req, res) {

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

    request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
        console.log(body);
        });

        // we can also pass the token to the browser to make requests from there

        // res.redirect('/#' +
        res.redirect('http://localhost:5000/music/#' +
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

app.get('/refresh_token', function(req, res) {

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

request.post(authOptions, function(error, response, body) {
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