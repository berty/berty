import { NavigationActions } from '@react-navigation/core'
import React from 'react'
import { withNavigation } from 'react-navigation'
import { withHOC } from '@berty/common/helpers/views'

const getSplitNavigator = navigation => {
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
      splitNavigator.dispatch(
        NavigationActions.navigate({ routeName: shownPaneRouteName })
      )
    }

    if (navigation.goBack(...args) === false) {
      navigation.navigate('placeholder')
      splitNavigator.dispatch(
        NavigationActions.navigate({ routeName: 'placeholder' })
      )
    }
  }

  return children({ goBack })
}

export const withGoBack = Component =>
  withHOC(
    withNavigation(
      class WithGoBack extends React.PureComponent {
        render() {
          return (
            <BackActionProvider navigation={this.props.navigation}>
              {({ goBack }) => <Component {...this.props} goBack={goBack} />}
            </BackActionProvider>
          )
        }
      }
    )
  )(Component)
