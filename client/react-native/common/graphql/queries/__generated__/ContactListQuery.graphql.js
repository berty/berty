/**
 * @flow
 * @relayHash 86ab408bbc569aa67f128300ae91fbbd
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type ContactListQueryVariables = {||};
export type ContactListQueryResponse = {|
  +ContactList: ?$ReadOnlyArray<?{|
    +id: ?string,
    +displayName: ?string,
    +overrideDisplayName: ?string,
  |}>
|};
export type ContactListQuery = {|
  variables: ContactListQueryVariables,
  response: ContactListQueryResponse,
|};
*/


/*
query ContactListQuery {
  ContactList {
    id
    displayName
    overrideDisplayName
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LinkedField",
    "alias": null,
    "name": "ContactList",
    "storageKey": null,
    "args": null,
    "concreteType": "BertyEntityContact",
    "plural": true,
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
        "name": "displayName",
        "args": null,
        "storageKey": null
      },
      {
        "kind": "ScalarField",
        "alias": null,
        "name": "overrideDisplayName",
        "args": null,
        "storageKey": null
      }
    ]
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "ContactListQuery",
  "id": null,
  "text": "query ContactListQuery {\n  ContactList {\n    id\n    displayName\n    overrideDisplayName\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "ContactListQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": v0
  },
  "operation": {
    "kind": "Operation",
    "name": "ContactListQuery",
    "argumentDefinitions": [],
    "selections": v0
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '595f92ec88615ab512326d79e307ab2a';
module.exports = node;
