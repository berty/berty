
const fs = require('fs');
const path = require('path');

module.exports.ContactRequest = fs.readFileSync(path.join(__dirname, 'ContactRequest.gql'), 'utf8');
module.exports.ContactRemove = fs.readFileSync(path.join(__dirname, 'ContactRemove.gql'), 'utf8');
module.exports.ContactUpdate = fs.readFileSync(path.join(__dirname, 'ContactUpdate.gql'), 'utf8');
module.exports.ConversationCreate = fs.readFileSync(path.join(__dirname, 'ConversationCreate.gql'), 'utf8');
module.exports.ConversationInvite = fs.readFileSync(path.join(__dirname, 'ConversationInvite.gql'), 'utf8');
module.exports.ConversationAddMessage = fs.readFileSync(path.join(__dirname, 'ConversationAddMessage.gql'), 'utf8');
