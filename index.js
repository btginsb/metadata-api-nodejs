const express = require('express')
const path = require('path')
const { HOST } = require('./src/constants')
const { Client } = require('pg');

require('dotenv').config();

const PORT = process.env.PORT || 5001

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.send('Invalid');
})

app.get('/api/token/:token_id', function(request, response) {
  const token_id = parseInt(request.params.token_id).toString()

  let data = {};

  client.connect();

  client.query('SELECT * FROM nfts WHERE id = $1', [token_id], (error, result) => {
    if(error) throw error;

    let row = result.rows[0];

    data = {
      platform: 'Gen8',
      tokenID: token_id,
      artist: row.artist,
      image: row.image,
      external_url: 'https://palmtreenft.com',
      attributes: {},
    };

    response.status(200).send(data);
  });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})