import React from 'react'
import hoistStatics from 'hoist-non-react-statics'
import { Store } from './store.gen'

const StoreContext = React.createContext()
const withStoreContext = Component => {
  return hoistStatics(
    props =>
      props.context &&
      props.context.constructor &&
      props.context.constructor === Store ? (
          <Component {...props} />
        ) : (
          <StoreContext.Consumer>
            {context => <Component {...props} context={context} />}
          </StoreContext.Consumer>
        ),
    Component
  )
}

export default StoreContext
export { StoreContext as Context, withStoreContext as withContext }
