import { NavigationActions } from '@react-navigation/core'
import React from 'react'
import { withNavigation } from 'react-navigation'

const getSplitNavigator = (navigation) => {
  if (!navigation) {
    return null
  }

  let parent = navigation.dangerouslyGetParent()

  while (navigation && parent) {
    if (parent.router && parent.router.isSplitNavigator) {
      return navigation
    }

    navigation = parent
    parent = parent.dangerouslyGetParent()
  }

  return null
}

const BackActionProvider = ({ navigation, children }) => {
  const splitNavigator = getSplitNavigator(navigation)
  if (!splitNavigator) {
    return children({ goBack: () => navigation.goBack(null) })
  }

  const shownPaneRouteName = splitNavigator.state.routeName

  let goBack = (...args) => {
    const splitNavigator = getSplitNavigator(navigation)

    if (splitNavigator) {
      splitNavigator.dispatch(NavigationActions.navigate({ routeName: shownPaneRouteName }))
    }

    if (navigation.goBack(...args) === false) {
      navigation.navigate('placeholder')
      splitNavigator.dispatch(NavigationActions.navigate({ routeName: 'placeholder' }))
    }
  }

  return children({ goBack })
}

const withGoBackBase = WrappedComponent => {
  class WrappedGoBack extends React.Component {
    render () {
      return <BackActionProvider navigation={this.props.navigation}>{({ goBack }) =>
        <WrappedComponent {...this.props} goBack={goBack} />
      }</BackActionProvider>
    }
  }
  WrappedGoBack.displayName = `WithGoBack(${getDisplayName(WrappedComponent)})`

  return WrappedGoBack
}

export const withGoBack = (props) => withNavigation(withGoBackBase(props))

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
