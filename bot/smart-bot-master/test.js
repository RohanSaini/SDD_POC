const cp = require('child_process');
const path = require('path');

const esPath = path.join(__dirname, 'elasticsearch', 'elasticsearch-7.5.0', 'bin');
console.log(esPath);
console.log(process.env.ComSpec);

var proc = cp.exec(
  path.join(__dirname, 'elasticsearch', 'elasticsearch-7.5.0', 'bin', 'elasticsearch')
);

// proc.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

proc.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});
