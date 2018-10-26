import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import { Header, Menu, Badge } from '../../../Library'
import { colors } from '../../../../constants'
import { choosePicture } from '../../../../helpers/react-native-image-picker'

export default class Edit extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Contact details'
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
    const contact = this.props.navigation.getParam('contact')
    return (
      <Menu>
        <Menu.Header
          icon={
            <Badge
              background={colors.blue}
              icon='camera'
              medium
              onPress={this.onChoosePicture}
            >
              <Image
                style={{ width: 78, height: 78, borderRadius: 39 }}
                source={{
                  uri:
                    this.state.uri ||
                    `https://api.adorable.io/avatars/285/${contact.id}.png`,
                }}
              />
            </Badge>
          }
        />
        <Menu.Section title='Firstname'>
          <Menu.Input
            value={
              (contact.overrideDisplayName || contact.displayName).split(
                ' '
              )[0] || ''
            }
          />
        </Menu.Section>
        <Menu.Section title='Lastname'>
          <Menu.Input
            value={
              (contact.overrideDisplayName || contact.displayName).split(
                ' '
              )[1] || ''
            }
          />
        </Menu.Section>
      </Menu>
    )
  }
}
