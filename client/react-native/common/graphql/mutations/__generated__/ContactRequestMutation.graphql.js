/**
 * @flow
 * @relayHash 78742a6451ebe27031bbf6351ea07617
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
    +status: ?BertyEntityContactStatus,
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
  $introText: String
) {
  ContactRequest(contactID: $contactID, introText: $introText) {
    id
    status
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
        "name": "status",
        "args": null,
        "storageKey": null
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
  "text": "mutation ContactRequestMutation(\n  $contactID: String!\n  $introText: String\n) {\n  ContactRequest(contactID: $contactID, introText: $introText) {\n    id\n    status\n    displayName\n    displayStatus\n    overrideDisplayName\n    overrideDisplayStatus\n  }\n}\n",
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
(node/*: any*/).hash = '9231acf7f328a793bb459f1bb4305377';
module.exports = node;
