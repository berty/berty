import React, { PureComponent } from 'react'
import { withHOC } from '@berty/common/helpers/views'

export const UpdateContext = React.createContext()

export const withUpdateContext = Component =>
  withHOC(
    class ComponentWithUpdateContext extends PureComponent {
      render () {
        return (
          <UpdateContext.Consumer>
            {context => {
              return <Component {...this.props} updateContext={context} />
            }}
          </UpdateContext.Consumer>
        )
      }
    }
  )(Component)

export default UpdateContext
