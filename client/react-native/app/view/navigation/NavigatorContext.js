import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

export const NavigatorContext = React.createContext({})

export const withNavigatorContext = Component => {
  const ComponentWithNavigatorContext = props => (
    <NavigatorContext.Consumer>
      {context => <Component {...props} navigatorContext={context} />}
    </NavigatorContext.Consumer>
  )

  return hoistNonReactStatics(ComponentWithNavigatorContext, Component)
}
