import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import RelayContext from '@berty/relay/RelayContext'

export default function withRelayContext (Component) {
  class ComponentWithRelayContext extends React.Component {
    static displayName = `withRelayContext(${Component.displayName ||
      Component.name})`

    render () {
      return (
        <RelayContext.Consumer>
          {context => {
            return <Component {...this.props} context={context} />
          }}
        </RelayContext.Consumer>
      )
    }
  }

  return hoistStatics(ComponentWithRelayContext, Component)
}
