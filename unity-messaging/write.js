import path from 'path';

const fs = require('fs');

const interval = 0;

function writeStream(filePath) {
  const wstream = fs.createWriteStream(filePath);
  setInterval(() => {
    const message = `${new Date().toString()} - ${+new Date()}\n`;
    wstream.write(message);
    console.log(`wrote ${message} to ${filePath}`);
  }, interval);
  // wstream.end();
}

const filePath = path.resolve(`${__dirname}/test/test.txt`);
writeStream(filePath);
