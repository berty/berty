import { NavigationActions } from 'react-navigation'

let _navigator

function setTopLevelNavigator (navigatorRef) {
  _navigator = navigatorRef
}

function navigate (routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  )
}

const action = action => {
  _navigator.dispatch(action)
}

// add other navigation functions that you need and export them

export default {
  action,
  navigate,
  setTopLevelNavigator,
}
