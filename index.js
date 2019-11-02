const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

// TODO: UN COMMENT. database not setup yet.
// var pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// });

var app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/hello', (req, res) => res.send('Hello There!'))
app.listen(PORT, () => console.log(`Listening on ${PORT}`))

app.post('/club/reg', (req,res) => {        // loads new reg to database +check if username already exist
    console.log(req.body);
    let body = req.body;
    let userCheck = `SELECT * FROM users WHERE username = '${body.username}';`;
    pool.query(userCheck, (error, result) => {
        if(result.rows.length > 0) {
            res.send("username already exists");
        }
    });

    var getUsersQuery = `INSERT INTO users (username , password) VALUES ('${body.username}' , '${body.password}');`;

    console.log(getUsersQuery);
    pool.query(getUsersQuery,(error,result)=>{
        if (error){
            res.send("error");
            console.log(error);
        }
        // res.redirect("actual app page");
        res.send("placeholder"); //after reg go straight to start screen
    })
})

app.get('club/login', (req, res) => {   //checks if username and password are correct
    var queryString = `SELECT * FROM users WHERE username='${req.query.username}';`
    pool.query(queryString, (error, result) => {
        if(error)
            res.send(error);
        if(result.rows[0].password === req.query.password){
            // res.redirect("actual app page")
            res.send("placeholder"); //logs in go to start screen 
        }
        res.send("failed log")
        console.log(result.rows);
        res.render('pages/return', {'result': result.rows});
    })
  })
