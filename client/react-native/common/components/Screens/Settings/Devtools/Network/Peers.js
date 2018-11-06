import React, { PureComponent } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import { Header, Screen } from '../../../../Library'
import { QueryReducer } from '../../../../../relay'
import { queries } from '../../../../../graphql'
import { colors } from '../../../../../constants'

export default class Peers extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Peers List'
        titleIcon='list'
        backBtn
      />
    ),
  })

  render () {
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <QueryReducer query={queries.Peers}>
          {(state, retry) => {
            console.log('state:', state)
            switch (state.type) {
              case state.success:
                return (
                  <View>
                    {state.data.Peers.list.map((peer, i) => (
                      <Text key={i}>{peer.id}</Text>
                    ))}
                  </View>
                )
              default:
                return <ActivityIndicator />
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}
