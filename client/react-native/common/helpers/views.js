import React from 'react'

export const withScreenProps = (WrappedComponent) => {
  class WithScreenProps extends React.Component {
    render = () => <WrappedComponent {...this.props} {...this.props.screenProps} />
  }

  WithScreenProps.displayName = `WithScreenProps(${getDisplayName(WrappedComponent)})`
  return WithScreenProps
}

const getDisplayName = (WrappedComponent) => WrappedComponent.displayName || WrappedComponent.name || 'Component'
