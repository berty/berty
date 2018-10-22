import { graphql } from 'react-relay'

const ContactList = graphql`
  query ContactListQuery(
    $filter: BertyEntityContactInput
    $count: Int32
    $cursor: String
  ) {
    ...ContactList @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`

ContactList.Received = graphql`
  query ContactListReceivedQuery(
    $filter: BertyEntityContactInput
    $count: Int32
    $cursor: String
  ) {
    ...ContactListReceived
      @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`

ContactList.Received.defaultVariables = {
  filter: {
    id: '',
    status: 4,
    displayName: '',
    displayStatus: '',
    overrideDisplayName: '',
    overrideDisplayStatus: '',
  },
  count: 10,
  cursor: '',
}

ContactList.Sent = graphql`
  query ContactListSentQuery(
    $filter: BertyEntityContactInput
    $count: Int32
    $cursor: String
  ) {
    ...ContactListSent
      @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`

ContactList.Sent.defaultVariables = {
  filter: {
    id: '',
    status: 3,
    displayName: '',
    displayStatus: '',
    overrideDisplayName: '',
    overrideDisplayStatus: '',
  },
  count: 10,
  cursor: '',
}

export default ContactList
