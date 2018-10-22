import { graphql } from 'react-relay'
import { contact } from '../../utils'
import { merge } from '../../helpers'

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
  filter: merge([
    contact.default,
    {
      status: 4,
    },
  ]),
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
  filter: merge([contact.default, { status: 3 }]),
  count: 10,
  cursor: '',
}

export default ContactList
