/**
 * @flow
 * @relayHash 5c2dd9d9ca8645160cd2830f4b5e49c4
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type ContactRequestMutationVariables = {|
  id?: ?string
|};
export type ContactRequestMutationResponse = {|
  +ContactRequest: ?{|
    +id: ?string
  |}
|};
export type ContactRequestMutation = {|
  variables: ContactRequestMutationVariables,
  response: ContactRequestMutationResponse,
|};
*/


/*
mutation ContactRequestMutation(
  $id: String
) {
  ContactRequest(id: $id) {
    id
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
v1 = [
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
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "id",
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
  "text": "mutation ContactRequestMutation(\n  $id: String\n) {\n  ContactRequest(id: $id) {\n    id\n  }\n}\n",
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
(node/*: any*/).hash = 'c01b482cd03510899e5e7d8cf4c2a5d3';
module.exports = node;
