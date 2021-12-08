const express = require('express')
const path = require('path')
const bodyParser = require("body-parser")
const { HOST } = require('./src/constants')
const { Client } = require('pg');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT || 5001

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({origin: '*'}));

app.get('/', function(req, res) {
  res.send('Invalid');
})

app.get('/api/token/:token_id', function(request, response) {
  const token_id = parseInt(request.params.token_id).toString()

  let data = {};

  client.query('SELECT * FROM nfts WHERE id = $1', [token_id], (error, result) => {
    if(error) throw error;

    let row = result.rows[0];

    if(!row) {
      response.status(404).send('Not found');
      return;
    }

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
});

app.post('/api/token', function (req, res) {
  console.log(req);

  const data = {
    token_id: req.body.token_id,
    image: req.body.image_url,
    artist:  req.body.artist,
    hash: req.body.hash,
    owner: req.body.owner,
  };

  client.query('INSERT INTO nfts (id, image, artist, hash, owner) VALUES($1, $2, $3, $4, $5) RETURNING id', [
      data.token_id,
      data.image,
      data.artist,
      data.hash,
      data.owner,
  ], function (error, results, fields) {
    if (error) throw error;

    console.log(results);

    res.send(results);
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});