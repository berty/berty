import React, { PureComponent } from 'react'
import { Text, ScrollView, TouchableOpacity, Clipboard } from 'react-native'
import { Header } from '../../../Library'
import { colors } from '../../../../constants'
import { padding } from '../../../../styles'

export default class EventDetails extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Details'
        titleIcon='crosshair'
        backBtn
      />
    ),
  })

  render () {
    const data = this.props.navigation.getParam('details')

    var fields = []
    var i = 0
    for (var key in data) {
      let value = data[key] || 'null'
      fields.push(
        <TouchableOpacity
          key={i++}
          style={[
            {
              backgroundColor: colors.white,
              borderBottomColor: '#bbb',
              borderBottomWidth: 1,
            },
            padding,
          ]}
          onPress={() => Clipboard.setString(value)}
        >
          <Text
            color={colors.black}
            style={{
              fontWeight: 'bold',
              marginBottom: 4,
            }}
          >
            {key}
          </Text>
          <Text color={colors.black}>{value}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <ScrollView style={{ backgroundColor: colors.background }}>
        {fields}
      </ScrollView>
    )
  }
}
