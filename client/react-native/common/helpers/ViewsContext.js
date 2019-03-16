import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

const ViewsContext = React.createContext({ views: {} })
export default ViewsContext

export function withViewsContext (Component) {
  class ComponentWithRelayContext extends React.Component {
    static displayName = `withViewsContext(${Component.displayName ||
    Component.name})`

    render () {
      return (
        <ViewsContext.Consumer>
          {context => {
            return (
              <Component
                {...this.props}
                viewsContext={context}
              />
            )
          }}
        </ViewsContext.Consumer>
      )
    }
  }

  return hoistStatics(ComponentWithRelayContext, Component)
}
