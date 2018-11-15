import { graphql } from 'react-relay'

import { contact } from '../../utils'
import { merge } from '../../helpers'
import { updater as updaterHelper } from '../../relay'

export const defaultArguments = {
  default: {
    filter: contact.default,
    orderBy: '',
    orderDesc: false,
  },
  Received: {
    filter: {
      ...contact.default,
      status: 4,
    },
    orderBy: '',
    orderDesc: false,
  },
  Sent: {
    filter: {
      ...contact.default,
      status: 3,
    },
    orderBy: '',
    orderDesc: false,
  },
}

export const updater = {
  default: (store, args = {}) =>
    updaterHelper(store).connection(
      'ContactList_ContactList',
      merge([defaultArguments.Default, args])
    ),
  Received: (store, args = {}) =>
    updaterHelper(store).connection(
      'ContactListReceived_ContactList',
      merge([defaultArguments.Received, args])
    ),
  Sent: (store, args = {}) =>
    updaterHelper(store).connection(
      'ContactListSent_ContactList',
      merge([defaultArguments.Sent, args])
    ),
}

export const Default = graphql`
  fragment ContactList on Query
    @argumentDefinitions(
      filter: { type: BertyEntityContactInput }
      count: { type: "Int32" }
      cursor: { type: "String" }
    ) {
    ContactList(
      filter: $filter
      first: $count
      after: $cursor
      orderBy: ""
      orderDesc: false
    ) @connection(key: "ContactList_ContactList") {
      edges {
        cursor
        node {
          id
          ...Contact
        }
      }
      pageInfo {
        count
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`

export const Received = graphql`
  fragment ContactListReceived on Query
    @argumentDefinitions(
      filter: { type: BertyEntityContactInput }
      count: { type: Int32 }
      cursor: { type: String }
    ) {
    ContactList(
      filter: $filter
      first: $count
      after: $cursor
      orderBy: ""
      orderDesc: false
    ) @connection(key: "ContactListReceived_ContactList") {
      edges {
        cursor
        node {
          id
          ...Contact
        }
      }
      pageInfo {
        count
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`

export const Sent = graphql`
  fragment ContactListSent on Query
    @argumentDefinitions(
      filter: { type: BertyEntityContactInput }
      count: { type: Int32 }
      cursor: { type: String }
    ) {
    ContactList(
      filter: $filter
      first: $count
      after: $cursor
      orderBy: ""
      orderDesc: false
    ) @connection(key: "ContactListSent_ContactList") {
      edges {
        cursor
        node {
          id
          ...Contact
        }
      }
      pageInfo {
        count
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`

export default Default
