const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

var pool = new Pool({
    ssl: true,
    connectionString: process.env.DATABASE_URL
});
var app = express();
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render("pages/club", {"props": {loginFailed: false}}));
app.get('/hello', (req, res) => res.send('Hello There!'));

app.get('/play', (req,res) => {
  res.render("pages/game")
})
app.get('/game', (req,res) => {
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
            console.log("results= " , results);
            res.render('pages/admin', { 'rows': results })
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
                  var results = {};
                  results.users = result.rows;
                  results.name = req.query.username;
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
            console.log(results.player);
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
                console.log(results.player);
                res.render('pages/leaderboard', { 'rows': results })
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

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
