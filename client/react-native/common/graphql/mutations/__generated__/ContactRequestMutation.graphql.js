/**
 * @flow
 * @relayHash 7650f6c56c61e5ea478c3fea131155d9
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type BertyEntityContactStatus = "IsBlocked" | "IsFriend" | "IsRequested" | "IsTrustedFriend" | "Myself" | "RequestedMe" | "Unknown" | "%future added value";
export type BertyEntityDeviceStatus = "Available" | "Connected" | "Disconnected" | "Myself" | "Unknown" | "%future added value";
export type ContactRequestMutationVariables = {|
  contactID: string
|};
export type ContactRequestMutationResponse = {|
  +ContactRequest: ?{|
    +id: ?string,
    +createdAt: ?any,
    +updatedAt: ?any,
    +deletedAt: ?any,
    +status: ?BertyEntityContactStatus,
    +devices: ?$ReadOnlyArray<?{|
      +id: ?string,
      +createdAt: ?any,
      +updatedAt: ?any,
      +deletedAt: ?any,
      +name: ?string,
      +status: ?BertyEntityDeviceStatus,
      +apiVersion: ?number,
      +contactId: ?string,
    |}>,
    +displayName: ?string,
    +displayStatus: ?string,
    +overrideDisplayName: ?string,
    +overrideDisplayStatus: ?string,
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
) {
  ContactRequest(contactID: $contactID) {
    id
    createdAt
    updatedAt
    deletedAt
    status
    devices {
      id
      createdAt
      updatedAt
      deletedAt
      name
      status
      apiVersion
      contactId
    }
    displayName
    displayStatus
    overrideDisplayName
    overrideDisplayStatus
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
  }
],
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "createdAt",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "updatedAt",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "deletedAt",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "status",
  "args": null,
  "storageKey": null
},
v6 = [
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
      }
    ],
    "concreteType": "BertyEntityContact",
    "plural": false,
    "selections": [
      v1,
      v2,
      v3,
      v4,
      v5,
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "devices",
        "storageKey": null,
        "args": null,
        "concreteType": "BertyEntityDevice",
        "plural": true,
        "selections": [
          v1,
          v2,
          v3,
          v4,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "name",
            "args": null,
            "storageKey": null
          },
          v5,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "apiVersion",
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
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "displayName",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "displayStatus",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "overrideDisplayName",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "overrideDisplayStatus",
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
  "text": "mutation ContactRequestMutation(\n  $contactID: String!\n) {\n  ContactRequest(contactID: $contactID) {\n    id\n    createdAt\n    updatedAt\n    deletedAt\n    status\n    devices {\n      id\n      createdAt\n      updatedAt\n      deletedAt\n      name\n      status\n      apiVersion\n      contactId\n    }\n    displayName\n    displayStatus\n    overrideDisplayName\n    overrideDisplayStatus\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ContactRequestMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v6
  },
  "operation": {
    "kind": "Operation",
    "name": "ContactRequestMutation",
    "argumentDefinitions": v0,
    "selections": v6
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'd80c6e3e0630e856cb928bb60ff5947e';
module.exports = node;
