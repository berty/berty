import { graphql, createPaginationContainer } from 'react-relay'
import * as queries from '../queries'

const ContactList = component =>
  createPaginationContainer(
    component,
    graphql`
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
    `,
    {
      direction: 'forward',
      getConnectionFromProps: props => {
        return props.data.ContactList
      },
      getFragmentVariables: (prevVars, totalCount) => {
        return {
          ...prevVars,
          count: totalCount,
        }
      },
      getVariables: (props, { count, cursor }, fragmentVariables) => {
        return { ...fragmentVariables, count, cursor }
      },
      query: queries.ContactList,
    }
  )

ContactList.Received = component =>
  createPaginationContainer(
    component,
    graphql`
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
    `,
    {
      direction: 'forward',
      getConnectionFromProps: props => {
        return props.data.ContactList
      },
      getFragmentVariables: (prevVars, totalCount) => {
        return {
          ...prevVars,
          count: totalCount,
        }
      },
      getVariables: (props, { count, cursor }, fragmentVariables) => {
        return { ...fragmentVariables, count, cursor }
      },
      query: queries.ContactList.Received,
    }
  )

ContactList.Sent = component =>
  createPaginationContainer(
    component,
    graphql`
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
    `,
    {
      direction: 'forward',
      getConnectionFromProps: props => {
        return props.data.ContactList
      },
      getFragmentVariables: (prevVars, totalCount) => {
        return {
          ...prevVars,
          count: totalCount,
        }
      },
      getVariables: (props, { count, cursor }, fragmentVariables) => {
        return { ...fragmentVariables, count, cursor }
      },
      query: queries.ContactList.Sent,
    }
  )

export default ContactList
