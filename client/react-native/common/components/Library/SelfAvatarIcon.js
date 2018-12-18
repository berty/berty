import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { Avatar, Header } from '.'
import { colors } from '../../constants'
import { CurrentUser } from '../../utils/contact'
import { extractPublicKeyFromId } from '../../helpers/contacts'
import NavigationService from '../../helpers/NavigationService'

class SelfAvatarLink extends PureComponent {
  onPress = (data) => {
    NavigationService.navigate('modal/contacts/card', {
      data,
    })
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

export default SelfAvatarLink
