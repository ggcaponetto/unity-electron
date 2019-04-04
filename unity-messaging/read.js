import fs from 'fs';
import path from 'path';
// const Promise = Promise;

function readFile(filePath, options) {
  const readData = [];
  return new Promise(resolve => {
    const stream = fs.createReadStream(filePath, options);
    stream.on('end', () => {
      // console.log("end");
      resolve(readData);
    });
    stream.on('error', error => {
      console.error('error');
      resolve(error);
    });
    stream.on('data', chunk => {
      // console.log("data");
      // console.log(`Received ${chunk.length} bytes of data.`);
      // console.log(`${chunk}`);
      readData.push(chunk);
    });
    stream.on('readable', function() {
      // console.log("readable");
      // There is some data to read now
      const data = this.read();
      while (data) {
        // console.log("readable data start.");
        // console.log(data);
        // console.log("readable data end.");
      }
    });
  });
}

let tailPointerBytes = 0;
async function init(options) {
  const filePath = path.resolve(`${__dirname}/test/test.txt`);

  const readData = await readFile(filePath, options).catch(e => {
    console.error(e.message);
  });

  const hasReadBytes = readData.length > 0 && readData[0].length > 0;

  if (hasReadBytes) {
    const readBytes = readData[0].length;
    const message = readData.toString();
    console.log(`read: ${message}`);
    tailPointerBytes += readBytes;
    return init({ start: tailPointerBytes }, readBytes);
  }
  return init({ start: tailPointerBytes });
}

init({ start: 0 });
