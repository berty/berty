
const fs = require('fs');
const path = require('path');

module.exports.EventStream = fs.readFileSync(path.join(__dirname, 'EventStream.gql'), 'utf8');
