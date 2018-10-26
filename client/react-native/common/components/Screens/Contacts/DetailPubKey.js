import React, { PureComponent } from 'react'
import { Clipboard } from 'react-native'
import { colors } from '../../../constants'
import {
  Flex,
  Screen,
  Header,
  Button,
  TextInputMultilineFix,
} from '../../Library'
import {
  padding,
  paddingVertical,
  textTiny,
  marginTop,
  rounded,
} from '../../../styles'

export default class DetailPublicKey extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    header: <Header navigation={navigation} title='Public key' backBtn />,
  })

  render () {
    const id = this.props.navigation.getParam('id')
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          <TextInputMultilineFix
            style={[
              {
                width: 330,
                height: 330,
                backgroundColor: colors.grey7,
                color: colors.black,
                flexWrap: 'wrap',
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            value={id}
            selectTextOnFocus
          />
          <Flex.Cols align='start'>
            <Flex.Rows>
              <Button
                icon='copy'
                background={colors.blue}
                margin
                padding
                rounded={23}
                height={24}
                medium
                middle
                center
                onPress={() => Clipboard.setString(id)}
              >
                COPY THE KEY
              </Button>
            </Flex.Rows>
          </Flex.Cols>
        </Flex.Rows>
      </Screen>
    )
  }
}
