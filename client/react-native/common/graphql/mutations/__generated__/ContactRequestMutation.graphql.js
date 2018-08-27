/**
 * @flow
 * @relayHash fac5e34c77dcd1fc85036e09231dc8d2
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type BertyEntityContactStatus = "IsBlocked" | "IsFriend" | "IsRequested" | "IsTrustedFriend" | "Myself" | "RequestedMe" | "Unknown" | "%future added value";
export type ContactRequestMutationVariables = {|
  contactID: string,
  introText?: ?string,
|};
export type ContactRequestMutationResponse = {|
  +ContactRequest: ?{|
    +id: ?string,
    +createdAt: ?any,
    +updatedAt: ?any,
    +deletedAt: ?any,
    +status: ?BertyEntityContactStatus,
  |}
|};
export type ContactRequestMutation = {|
  variables: ContactRequestMutationVariables,
  response: ContactRequestMutationResponse,
|};
*/


/*
mutation ContactRequestMutation(
  $contactID: String!
  $introText: String
) {
  ContactRequest(contactID: $contactID, introText: $introText) {
    id
    createdAt
    updatedAt
    deletedAt
    status
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "contactID",
    "type": "String!",
    "defaultValue": null
  },
  {
    "kind": "LocalArgument",
    "name": "introText",
    "type": "String",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "ContactRequest",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "contactID",
        "variableName": "contactID",
        "type": "String!"
      },
      {
        "kind": "Variable",
        "name": "introText",
        "variableName": "introText",
        "type": "String"
      }
    ],
    "concreteType": "BertyEntityContact",
    "plural": false,
    "selections": [
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "id",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "createdAt",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "updatedAt",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "deletedAt",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "status",
        "args": null,
        "storageKey": null
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "mutation",
  "name": "ContactRequestMutation",
  "id": null,
  "text": "mutation ContactRequestMutation(\n  $contactID: String!\n  $introText: String\n) {\n  ContactRequest(contactID: $contactID, introText: $introText) {\n    id\n    createdAt\n    updatedAt\n    deletedAt\n    status\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ContactRequestMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "ContactRequestMutation",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '1b9976b06f79748521e6f41349da4b2f';
module.exports = node;
