import { graphql } from 'react-relay'
import { subscriber } from '../../relay'

// continues = 1;    // stay connected and wait for new lines
// string log_level = 2;  // "debug", "info", "warn", "error"
// string namespaces = 3;  // "core.*", "*", ...
// int32 last

const LogStream = graphql`
  subscription LogStreamSubscription(
    $continues: Bool!
    $logLevel: String!
    $namespaces: String!
    $last: Int32!
  ) {
    LogStream(
      continues: $continues
      logLevel: $logLevel
      namespaces: $namespaces
      last: $last
    ) {
      line
    }
  }
`

export default context => variables =>
  subscriber({
    environment: context.environment,
    subscription: LogStream,
    variables,
  })
