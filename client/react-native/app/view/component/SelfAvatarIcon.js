import React, { PureComponent } from 'react'

import Loader from './Loader'
import { TouchableOpacity } from 'react-native'
import { withNavigation } from 'react-navigation'

import Avatar from './Avatar'
import { Store } from '@berty/container'

@withNavigation
class SelfAvatarLink extends PureComponent {
  onPress = data => {
    this.props.navigation.navigate('modal/contacts/card', data)
  }

  render() {
    return (
      <Store.Entity.Contact status={42}>
        {data =>
          data ? (
            <TouchableOpacity onPress={() => this.onPress(data)}>
              <Avatar data={data} size={24} />
            </TouchableOpacity>
          ) : (
            <Loader />
          )
        }
      </Store.Entity.Contact>
    )
  }
}

export default SelfAvatarLink
