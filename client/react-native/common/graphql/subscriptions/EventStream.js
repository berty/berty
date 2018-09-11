import { graphql } from 'react-relay'
import { subscriber } from '../../relay'

const EventStream = graphql`
  subscription EventStreamSubscription {
    EventStream {
      senderId
    }
  }
`

export default subscriber({ subscription: EventStream })
