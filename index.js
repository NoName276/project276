const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

var pool = new Pool({
    ssl: true,

    connectionString:"postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
    //process.env.DATABASE_URL
});
var app = express();
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render("pages/club", {"props": {loginFailed: false}}));
app.get('/hello', (req, res) => res.send('Hello There!'));

app.get('/play', (req,res) => {
  res.render("pages/play")
})
app.get('/game', (req,res) => {
  res.render("pages/game")
})
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

app.post('/club/reg', (req,res) => {        // loads new reg to database +check if username already exist
  console.log(req.body);
  let body = req.body;
  let userCheck = `SELECT * FROM users WHERE username = '${body.username}';`;
  pool.query(userCheck, (error, result) => {
    if(result.rows.length > 0) {
      res.render('pages/club', {'props': {regFailed: true}});
      return;
    }
      var getUsersQuery = `INSERT INTO users (username , password) VALUES ('${body.username}' , '${body.password}');`;
      var getStatsQuery = `INSERT INTO stats (username , gamesplayed, gameswon, gameslost, gamesdrawn, highscore, totalpoints) VALUES ('${body.username}' , 0, 0, 0, 0, 0, 0);`;
    console.log(getUsersQuery);
    pool.query(getUsersQuery,(error,result)=>{
      if (error){
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
    res.render("pages/club", {"props": {loginFailed: false}})
})

app.post("/club/login", (req, res) => {
  console.log(req.body);
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
                var results = {'rows': result.rows };
                res.render('pages/admin', results)  // load admin page for admins
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

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
