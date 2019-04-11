const express = require('express');

const app = express();
export default function run(cb) {
  app.get('/', (req, res) => {
    console.log('got request', { req, res });
    res.send('Hello World!');
    cb({ req, res });
  });

  app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
  });
}
