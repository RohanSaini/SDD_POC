const path = require('path');
const cp = require('child_process');
const { Client } = require('@elastic/elasticsearch');

// var elasticsearchProcess;

const initializeESProcess = async () => {
  // console.log(path.join(__dirname, 'elasticsearch-7.5.0', 'bin'));
  // if (elasticsearchProcess) return elasticsearchProcess;
  // console.log('new ES instance created');
  var elasticsearchProcess = cp
    .exec(path.join(__dirname, 'elasticsearch-7.5.0', 'bin', 'elasticsearch'))
    .on('exit', (code, signal) => {
      console.log('elasticsearchProcess process exited successfully');
    });
  // .spawn('elasticsearch', {
  //   cwd: path.join(__dirname, 'elasticsearchProcess-7.5.0', 'bin')
  // })
  return elasticsearchProcess;
};

const getESInstance = async () => {
  // if (client) return client;
  // console.log('new ES client instance created')
  return new Client({ node: 'http://localhost:9200' });
};

module.exports = {
  initializeESProcess,
  getESInstance
};
