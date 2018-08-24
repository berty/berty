/**
 * @flow
 * @relayHash 50e99ed296e44445fae835895914e067
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type BertyEntityContactStatus = "IsBlocked" | "IsFriend" | "IsRequested" | "IsTrustedFriend" | "Myself" | "RequestedMe" | "Unknown" | "%future added value";
export type BertyEntityDeviceStatus = "Available" | "Connected" | "Disconnected" | "Myself" | "Unknown" | "%future added value";
export type contactRequestMutationVariables = {|
  id?: ?string
|};
export type contactRequestMutationResponse = {|
  +ContactRequest: ?{|
    +id: ?string,
    +createdAt: ?{|
      +seconds: ?number,
      +nanos: ?number,
    |},
    +updatedAt: ?{|
      +seconds: ?number,
      +nanos: ?number,
    |},
    +deletedAt: ?{|
      +seconds: ?number,
      +nanos: ?number,
    |},
    +status: ?BertyEntityContactStatus,
    +devices: ?$ReadOnlyArray<?{|
      +id: ?string,
      +createdAt: ?{|
        +seconds: ?number,
        +nanos: ?number,
      |},
      +updatedAt: ?{|
        +seconds: ?number,
        +nanos: ?number,
      |},
      +deletedAt: ?{|
        +seconds: ?number,
        +nanos: ?number,
      |},
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
export type contactRequestMutation = {|
  variables: contactRequestMutationVariables,
  response: contactRequestMutationResponse,
|};
*/


/*
mutation contactRequestMutation(
  $id: String
) {
  ContactRequest(id: $id) {
    id
    createdAt {
      seconds
      nanos
    }
    updatedAt {
      seconds
      nanos
    }
    deletedAt {
      seconds
      nanos
    }
    status
    devices {
      id
      createdAt {
        seconds
        nanos
      }
      updatedAt {
        seconds
        nanos
      }
      deletedAt {
        seconds
        nanos
      }
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
    "name": "id",
    "type": "String",
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
v2 = [
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "seconds",
    "args": null,
    "storageKey": null
  },
  {
    "kind": "ScalarField",
    "alias": null,
    "name": "nanos",
    "args": null,
    "storageKey": null
  }
],
v3 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "createdAt",
  "storageKey": null,
  "args": null,
  "concreteType": "GoogleProtobufTimestamp",
  "plural": false,
  "selections": v2
},
v4 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "updatedAt",
  "storageKey": null,
  "args": null,
  "concreteType": "GoogleProtobufTimestamp",
  "plural": false,
  "selections": v2
},
v5 = {
  "kind": "LinkedField",
  "alias": null,
  "name": "deletedAt",
  "storageKey": null,
  "args": null,
  "concreteType": "GoogleProtobufTimestamp",
  "plural": false,
  "selections": v2
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "status",
  "args": null,
  "storageKey": null
},
v7 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "ContactRequest",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id",
        "type": "String"
      }
    ],
    "concreteType": "BertyEntityContact",
    "plural": false,
    "selections": [
      v1,
      v3,
      v4,
      v5,
      v6,
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
          v3,
          v4,
          v5,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "name",
            "args": null,
            "storageKey": null
          },
          v6,
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
  "name": "contactRequestMutation",
  "id": null,
  "text": "mutation contactRequestMutation(\n  $id: String\n) {\n  ContactRequest(id: $id) {\n    id\n    createdAt {\n      seconds\n      nanos\n    }\n    updatedAt {\n      seconds\n      nanos\n    }\n    deletedAt {\n      seconds\n      nanos\n    }\n    status\n    devices {\n      id\n      createdAt {\n        seconds\n        nanos\n      }\n      updatedAt {\n        seconds\n        nanos\n      }\n      deletedAt {\n        seconds\n        nanos\n      }\n      name\n      status\n      apiVersion\n      contactId\n    }\n    displayName\n    displayStatus\n    overrideDisplayName\n    overrideDisplayStatus\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "contactRequestMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v7
  },
  "operation": {
    "kind": "Operation",
    "name": "contactRequestMutation",
    "argumentDefinitions": v0,
    "selections": v7
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'ce002efc539aa79c27b44969c05b33bf';
module.exports = node;
