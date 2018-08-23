
const fs = require('fs');
const path = require('path');

module.exports.EventList = fs.readFileSync(path.join(__dirname, 'EventList.gql'), 'utf8');
module.exports.ContactList = fs.readFileSync(path.join(__dirname, 'ContactList.gql'), 'utf8');
module.exports.ConversationList = fs.readFileSync(path.join(__dirname, 'ConversationList.gql'), 'utf8');
