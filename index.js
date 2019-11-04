const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

var pool = new Pool({
    ssl: true,
    connectionString:"postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
});
var app = express();
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
app.get('/hello', (req, res) => res.send('Hello There!'));

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
        console.log(getUsersQuery);
        pool.query(getUsersQuery,(error,result)=>{
            if (error){
                res.send("error");
                console.log(error);
            }
            res.render("pages/club", {props: {}});
        });
    });
})

app.get("/club", (req, res) => {
    res.render("pages/club", {"props": {loginFailed: false}})
})

app.get("/club/login", (req, res) => {
  console.log(`login form: ${res.query}`);
    var queryString = `SELECT * FROM users WHERE username='${req.query.username}';`;
    pool.query(queryString, (error, result) => {
        if(error)
            res.send(error);
        if(result.rows.length > 0 && result.rows[0].password === req.query.password){
            if(result.rows[0].type === "admin"){ 
                res.render("pages/admin");   // load admin page for admins
            }else{
                res.render("pages/play");    // load user page for users
            }
        }
        res.render('pages/club', {'props': {loginFailed: true}});
    })

})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));