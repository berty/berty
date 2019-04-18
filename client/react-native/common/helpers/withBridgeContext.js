import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import BridgeContext from '../bridge'

export default (Component) => {
  class ComponentWithBridgeContext extends React.Component {
    static displayName = `withBridgeContext(${Component.displayName ||
      Component.name})`

    render () {
      return (
        <BridgeContext.Consumer>
          {context => {
            return (
              <Component
                {...this.props}
                bridge={context}
              />
            )
          }}
        </BridgeContext.Consumer>
      )
    }
  }

  return hoistStatics(ComponentWithBridgeContext, Component)
}
