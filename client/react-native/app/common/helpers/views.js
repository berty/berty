import React, { PureComponent } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'

export const Children = props =>
  React.Children.map(props.children, child => React.cloneElement(child, props))

export const withScreenProps = Component =>
  withHOC(
    class WithScreenProps extends PureComponent {
      render () {
        return <Component {...this.props} {...this.props.screenProps} />
      }
    }
  )(Component)

export const withProps = props => Component =>
  withHOC(
    class WithProps extends PureComponent {
      render () {
        return <Component {...this.props} {...props} />
      }
    }
  )(Component)

export const withContext = Context => Component =>
  withHOC(
    class WithContext extends PureComponent {
      static displayName = `WithContext(${getDisplayName(Context)})`

      render () {
        const { context } = this.props
        if (context && context.constructor && context.constructor === Context) {
          return <Component {...this.props} context={context} />
        }
        return (
          <Context.Consumer>
            {context => {
              return <Component {...this.props} context={context} />
            }}
          </Context.Consumer>
        )
      }
    }
  )(Component)

export const asFunctional = Component =>
  hoistNonReactStatic(function AsFunctional (props) {
    return <Component {...props} />
  }, Component)

export const withHOC = HOC => Component =>
  hoistNonReactStatic(
    class extends HOC {
      static displayName = `${getDisplayName(HOC)}(${getDisplayName(
        Component
      )})`
    },
    Component
  )

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
