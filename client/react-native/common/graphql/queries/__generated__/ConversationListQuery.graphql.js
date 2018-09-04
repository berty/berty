/**
 * @flow
 * @relayHash 63c450a09bdf7f1275d591e224ddc14e
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type BertyEntityConversationMemberStatus = "Active" | "Blocked" | "Owner" | "Unknown" | "%future added value";
export type ConversationListQueryVariables = {||};
export type ConversationListQueryResponse = {|
  +ConversationList: ?$ReadOnlyArray<?{|
    +id: ?string,
    +title: ?string,
    +topic: ?string,
    +members: ?$ReadOnlyArray<?{|
      +id: ?string,
      +status: ?BertyEntityConversationMemberStatus,
      +conversationId: ?string,
      +contactId: ?string,
    |}>,
  |}>
|};
export type ConversationListQuery = {|
  variables: ConversationListQueryVariables,
  response: ConversationListQueryResponse,
|};
*/


/*
query ConversationListQuery {
  ConversationList {
    id
    title
    topic
    members {
      id
      status
      conversationId
      contactId
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "ConversationList",
    "storageKey": null,
    "args": null,
    "concreteType": "BertyEntityConversation",
    "plural": true,
    "selections": [
      v0,
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "title",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "topic",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "members",
        "storageKey": null,
        "args": null,
        "concreteType": "BertyEntityConversationMember",
        "plural": true,
        "selections": [
          v0,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "status",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "conversationId",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "contactId",
            "args": null,
            "storageKey": null
          }
        ]
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "ConversationListQuery",
  "id": null,
  "text": "query ConversationListQuery {\n  ConversationList {\n    id\n    title\n    topic\n    members {\n      id\n      status\n      conversationId\n      contactId\n    }\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ConversationListQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "ConversationListQuery",
    "argumentDefinitions": [],
    "selections": v1
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'b9d7d06312d618f3b6855044d88ddc7b';
module.exports = node;
