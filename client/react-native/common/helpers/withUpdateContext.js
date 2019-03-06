import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import { UpdateContext } from '../update'

export default function withUpdateContext (Component) {
  class ComponentWithUpdateContext extends React.Component {
    static displayName = `withUpdateContext(${Component.displayName ||
      Component.name})`

    render () {
      return (
        <UpdateContext.Consumer>
          {context => {
            return (
              <Component
                {...this.props}
                updateContext={context}
              />
            )
          }}
        </UpdateContext.Consumer>
      )
    }
  }

  return hoistStatics(ComponentWithUpdateContext, Component)
}
