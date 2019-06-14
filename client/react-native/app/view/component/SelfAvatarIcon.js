import { TouchableOpacity } from 'react-native'
import React, { PureComponent } from 'react'
import { withNavigation } from 'react-navigation'

import Avatar from './Avatar'
import { HeaderButton } from './Header'
import { colors } from '@berty/common/constants'

@withNavigation
// @withCurrentUser
class SelfAvatarLink extends PureComponent {
  onPress = data => {
    this.props.navigation.navigate('modal/contacts/card', data)
  }

  render = () => {
    let user = this.props.currentUser

    return user ? (
      <TouchableOpacity onPress={() => this.onPress(user)}>
        <Avatar data={{ ...user, id: user.id }} size={24} />
      </TouchableOpacity>
    ) : (
      <HeaderButton icon={'share'} color={colors.black} justify='end' middle />
    )
  }
}

export default SelfAvatarLink
