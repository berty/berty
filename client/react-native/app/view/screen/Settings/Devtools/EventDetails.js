import React, { PureComponent } from 'react'
import { Text, ScrollView, TouchableOpacity, Clipboard } from 'react-native'
import { Header } from '@berty/component'
import { colors } from '@berty/common/constants'
import { padding } from '@berty/common/styles'
import { withStoreContext } from '@berty/store/context'

@withStoreContext
class EventDetails extends PureComponent {
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

    const fields = [
      <TouchableOpacity
        key={'retry'}
        style={[
          {
            backgroundColor: colors.white,
            borderBottomColor: '#bbb',
            borderBottomWidth: 1,
          },
          padding,
        ]}
        onPress={async () => {
          try {
            await this.props.context.node.service.debugRequeueEvent({
              eventId: data.id,
            })
          } catch (err) {
            this.setState({ err })
            console.error(err)
          }
        }}
      >
        <Text
          color={colors.black}
          style={{
            fontWeight: 'bold',
            marginBottom: 4,
          }}
        >
          {'Requeue this event'}
        </Text>
      </TouchableOpacity>,
    ]

    for (let key of Object.keys(data)) {
      let value = data[key] || 'null'
      fields.push(
        <TouchableOpacity
          key={key}
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

export default EventDetails
