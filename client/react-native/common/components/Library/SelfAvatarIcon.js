import { TouchableOpacity } from 'react-native'
import React, { PureComponent } from 'react'

import { Avatar, Header } from '.'
import { colors } from '../../constants'
import { contact } from '../../utils'
import { withCurrentUser } from '../../utils/contact'
import NavigationService from '../../helpers/NavigationService'

class SelfAvatarLink extends PureComponent {
  onPress = data => {
    NavigationService.navigate('modal/contacts/card', data)
  }

  render = () => {
    let user = this.props.currentUser

    return user ? (
      <TouchableOpacity onPress={() => this.onPress(user)}>
        <Avatar data={{ ...user, id: contact.getCoreID(user.id) }} size={24} />
      </TouchableOpacity>
    ) : (
      <Header.HeaderButton
        icon={'share'}
        color={colors.black}
        justify='end'
        middle
      />
    )
  }
}

export default withCurrentUser(SelfAvatarLink)
