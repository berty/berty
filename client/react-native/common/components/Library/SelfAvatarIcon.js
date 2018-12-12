import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { Avatar, Header } from '.'
import { NavigationActions, withNavigation } from 'react-navigation'
import { colors } from '../../constants'
import { CurrentUser } from '../../utils/contact'
import { extractPublicKeyFromId } from '../../helpers/contacts'

class SelfAvatarLink extends PureComponent {
  onPress = (data) => {
    const { navigation } = this.props

    navigation.dispatch(NavigationActions.navigate({
      routeName: 'modal/contacts/card',
      params: {
        data,
      },
    }))
  }

  render = () => <CurrentUser>{user => {
    user = user ? { ...user, id: extractPublicKeyFromId(user.id) } : null

    return user
      ? <TouchableOpacity onPress={() => this.onPress(user)}>
        <Avatar data={user} size={24} />
      </TouchableOpacity>
      : <Header.HeaderButton
        icon={'share'}
        color={colors.black}
        justify='end'
        middle
      />
  }
  }</CurrentUser>
}

const ConnectedSelfAvatarLink = withNavigation(SelfAvatarLink)

export default ConnectedSelfAvatarLink
