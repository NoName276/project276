const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))

  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  /*.get('/index', (req,res) => {
    var getTokimonQuery = `SELECT * FROM tokimon`;
    pool.query(getTokimonQuery, (error, result) => {
      if (error)
        res.end(error);
      var results = {'rows': result.rows };
      res.render('pages/index', results)
    })
  })*/
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM tokimon');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
