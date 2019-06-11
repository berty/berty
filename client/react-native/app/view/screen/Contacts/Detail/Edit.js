import React, { PureComponent } from 'react'
import { Header, Menu, Badge, Avatar, Loader } from '@berty/component'
import { colors } from '@berty/common/constants'
import { choosePicture } from '@berty/common/helpers/react-native-image-picker'
import I18n from 'i18next'
import { Store } from '@berty/container'

export default class Edit extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('contacts.details')}
        rightBtnIcon={'save'}
        onPressRightBtn={() => console.log('Saved')}
        backBtn
      />
    ),
  })

  state = {
    uri: null,
  }

  onChoosePicture = async event => this.setState(await choosePicture(event))

  render () {
    const id = this.props.navigation.getParam('id') || {}

    return (
      <Store.Entity.Contact id={id}>
        {contact =>
          contact ? (
            <Menu>
              <Menu.Header
                icon={
                  <Badge
                    background={colors.blue}
                    icon='camera'
                    medium
                    onPress={this.onChoosePicture}
                  >
                    <Avatar data={contact} size={78} />
                  </Badge>
                }
              />
              <Menu.Section title='Nickname'>
                <Menu.Input
                  value={
                    contact.overrideDisplayName || contact.displayName || ''
                  }
                />
              </Menu.Section>
            </Menu>
          ) : (
            <Loader />
          )
        }
      </Store.Entity.Contact>
    )
  }
}
