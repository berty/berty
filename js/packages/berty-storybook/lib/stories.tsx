import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

namespace Storybook {
  export interface API {
    storiesOf(
      arg0: string,
      arg1: object
    ): { add(arg0: string, arg1: React.FunctionComponent): void }
  }
}

const { centeredView } = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})

export default (api: Storybook.API): void => {
  const CenteredView: React.FunctionComponent = (props) => {
    return <View style={centeredView}>{props.children}</View>
  }

  api.storiesOf('CenteredView', module).add('default view', function() {
    return (
      <CenteredView>
        <Text>Hello Storybook</Text>
      </CenteredView>
    )
  })

  api.storiesOf('OtherCenteredView', module).add('default view', function() {
    return (
      <CenteredView>
        <Text>Hello Storybook 2</Text>
      </CenteredView>
    )
  })
}
