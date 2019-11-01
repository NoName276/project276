const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg')
var pool
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:true
})


express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))

  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM tokimon ORDER BY id');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/insert', async (req,res)=>{
    try {
    //console.log('post')
    //console.log(req.body)
    var attSum = parseInt(req.body.fly,10) + parseInt(req.body.fight, 10) + parseInt(req.body.fire,10) + parseInt(req.body.water,10) + parseInt(req.body.electric,10) + parseInt(req.body.ice,10)
    //console.log(attSum)
    var insertTokiQuery = `INSERT INTO tokimon values(default, $1, ${req.body.weight}, ${req.body.height}, ${req.body.fly}, ${req.body.fight}, ${req.body.fire}, ${req.body.water}, ${req.body.electric}, ${req.body.ice}, ${attSum}, $2);`
    //console.log(insertTokiQuery)
    var getLatestQuery = `SELECT * FROM tokimon ORDER BY id DESC limit 1`
    const client = await pool.connect()
    const insertresult = await client.query(insertTokiQuery, [req.body.name, req.body.trainer])
    const result = await client.query(getLatestQuery)
    const results = { 'results': (result) ? result.rows : null};
      res.render('pages/display', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/alter', async (req,res)=>{
    try {
    //console.log('post')
    //console.log(req.body)
    var attSum = parseInt(req.body.fly,10) + parseInt(req.body.fight, 10) + parseInt(req.body.fire,10) + parseInt(req.body.water,10) + parseInt(req.body.electric,10) + parseInt(req.body.ice,10)
    //console.log(attSum)
    var updateTokiQuery = `UPDATE tokimon 
    SET name = $1, weight = ${req.body.weight}, height = ${req.body.height}, fly = ${req.body.fly}, fight = ${req.body.fight}, 
      fire = ${req.body.fire}, water = ${req.body.water}, electric = ${req.body.electric}, ice = ${req.body.ice}, total = ${attSum}, 
      trainer = $2
    WHERE id = ${req.body.id};`
    //console.log(updateTokiQuery)
    var getLatestQuery = `SELECT * FROM tokimon WHERE id = ${req.body.id}`
    const client = await pool.connect()
    const insertresult = await client.query(updateTokiQuery, [req.body.name, req.body.trainer])
    const result = await client.query(getLatestQuery)
    const results = { 'results': (result) ? result.rows : null};
      res.render('pages/display', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .post('/search', async (req,res)=>{
    try {
      //console.log('post')
      //console.log(req.body)
      var getTokiQuery = `SELECT * FROM tokimon WHERE id = ${req.body.id}`
      const client = await pool.connect()
      const result = await client.query(getTokiQuery)
      const results = { 'results': (result) ? result.rows : null};
      //console.log(results.results.length);
        if(results.results.length >= 1){
        res.render('pages/display', results );
        } else
        {
          res.render('pages/search', {err:"There is not tokimon with this id, please enter another id."});
        }
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
  })
  .post('/delete', async (req,res)=>{
    try {
      //console.log('post')
      //console.log(req.body)
      var getTokiQuery = `DELETE FROM tokimon WHERE id = ${req.body.id}`
      const client = await pool.connect()
      const result = await client.query(getTokiQuery)
      const results = { 'results': (result) ? result.rows : null};
      //console.log(results.results.length);
      res.render('pages/search', {err:"Your tokimon has been deleted."});
      client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
  })
  .post('/sort', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query(`SELECT * FROM tokimon ORDER BY ${req.body.sortAtt} ${req.body.sortType}`);
      const results = { 'results': (result) ? result.rows : null, 'att':req.body.sortAtt,'type':req.body.sortType};
      //console.log(results)
      res.render('pages/tokidex', results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
