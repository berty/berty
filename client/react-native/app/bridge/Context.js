import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

export const BridgeContext = React.createContext()

export const withBridgeContext = Component => {
  class ComponentWithBridgeContext extends React.Component {
    static displayName = `withBridgeContext(${Component.displayName ||
      Component.name})`

    render() {
      return (
        <BridgeContext.Consumer>
          {context => {
            console.log('new context', context)
            return <Component {...this.props} bridge={context} />
          }}
        </BridgeContext.Consumer>
      )
    }
  }

  return hoistStatics(ComponentWithBridgeContext, Component)
}

export default BridgeContext
