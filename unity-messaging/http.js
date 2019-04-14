import express from 'express';

const bodyParser = require('body-parser');

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

export default function listen(onMessage) {
  app.get('/', (req, res) => {
    // console.log('got get request', { req, res });
    res.send('Hello World (get)!');
    onMessage({ req, res });
  });

  app.post('/', (req, res) => {
    // console.log('got post request', { req, res });
    res.send('Hello World (post)!');
    onMessage({ req, res });
  });

  app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
  });
}

// listen((data) => {console.log(data)});
