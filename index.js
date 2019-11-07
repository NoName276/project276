const express = require('express')
const path = require('path')
var SpotifyWebApi = require('spotify-web-api-node');
const PORT = process.env.PORT || 5000

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
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

app.get('/music', function (req, res) {
    res.render('pages/music-client');
});

app.get('/song', (req,res) => {
    // res.send({
    //     name: 'test',
    //     artist: 'me'
    // })
    res.render('pages/song');
})

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: '76399d6d66784fbd9b089a5363553e47',
    clientSecret: '5d6ec7245f5a4902af2f5b40c6315a63',
    redirectUri: 'http://localhost:5000/song'
});

spotifyApi.setAccessToken('BQAAyBx7cC619XISfnJ5Y3ZTby2-bNkiwlRGnRK7Mt6iDYoQ8v8leJVhLgblnG1i87lt6U3JSzykQdR_lcstsonhk_JbwI9o7p4NWc3O28kjotfk_LAMp38RkSVE7Oa5VOLsG7DIq94JSoreGAWXaDYtkElsehzf3SFGNr_IDRbxmJw-PmDUj9dNLQ');

spotifyApi.getMyCurrentPlaybackState({
})
.then(function(data) {
  // Output items
//   console.log("Now Playing: ",data.body);
  console.log("Now Playing: ",data.body.item.artists[0].name);
  console.log("Now Playing: ",data.body.item.name);
//   console.log("Now Playing: ",data.body.item.uri);
  var trackURI = data.body.item.uri;
  var trackURIFormatted = trackURI.replace('spotify:track:', '')
  console.log(trackURIFormatted)
//   console.log("Now Playing: ",data.body.name);
//   console.log("Now Playing: ",data.body.artists);
}, function(err) {
  console.log('Something went wrong!', err);
});

/* Get Audio Analysis for a Track */
spotifyApi.getAudioAnalysisForTrack('0rKtyWc8bvkriBthvHKY8d')
  .then(function(data) {
    console.log(data.body.track.duration);
    console.log(data.body.track.tempo);
  }, function(err) {
    done(err);
});
  
spotifyApi.getTrack('0rKtyWc8bvkriBthvHKY8d')
  .then(function(data) {
    console.log(data.body.name);
    console.log(data.body.artists[0].name);
  }, function(err) {
    done(err);
});

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