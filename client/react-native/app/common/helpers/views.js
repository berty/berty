import React from 'react'
import Icon from '@berty/view/component/Icon'
import colors from '@berty/common/constants/colors'

export const withScreenProps = WrappedComponent => {
  class WithScreenProps extends React.Component {
    render = () => (
      <WrappedComponent {...this.props} {...this.props.screenProps} />
    )
  }

  WithScreenProps.displayName = `WithScreenProps(${getDisplayName(
    WrappedComponent
  )})`
  return WithScreenProps
}

export const tabIcon = iconName => {
  const NamedTabIcon = ({ focused }) => (
    <Icon
      name={iconName}
      color={focused ? colors.blue : colors.darkGrey}
      size={20}
    />
  )

  return NamedTabIcon
}

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
