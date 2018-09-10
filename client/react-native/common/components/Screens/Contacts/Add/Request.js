import React, { PureComponent } from 'react'
import { FlatList, TouchableOpacity, Image } from 'react-native'
import { Screen, Flex, Text, Separator } from '../../../Library'
import { colors } from '../../../../constants'
import {
  borderTop,
  marginHorizontal,
} from '../../../../styles'
import { QueryReducer } from '../../../../relay'
import { queries } from '../../../../graphql'

const Item = ({
  data: { id, displayName, overrideDisplayName },
  navigation,
}) => (
  <TouchableOpacity
    onPress={() => navigation.push('RequestValidation', { id })}
    style={[
      {
        backgroundColor: colors.white,
        paddingVertical: 16,
        height: 71,
      },
      marginHorizontal,
    ]}
  >
    <Flex.Cols align='left'>
      <Flex.Rows size={1} align='left' style={{ marginLeft: 30 }}>
        <Image
          style={{ width: 40, height: 40, borderRadius: 50 }}
          source={{
            uri:
              'https://api.adorable.io/avatars/285/' +
              (overrideDisplayName || displayName) +
              '.png',
          }}
        />
      </Flex.Rows>
      <Flex.Rows size={6} align='left' style={{ marginLeft: 14 }}>
        <Text color={colors.black} left middle>
          {overrideDisplayName || displayName}
        </Text>
        <Text color={colors.subtleGrey} tiny>
          Request received 3 hours ago ...
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
)

export default class Request extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }, borderTop]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => (
            <FlatList
              data={([].concat(state.data.ContactList || [])).filter(entry => entry.status === 'RequestedMe')}
              ItemSeparatorComponent={({ highlighted }) => (
                <Separator highlighted={highlighted} />)} refreshing={state.type === state.loading}
              onRefresh={retry}
              renderItem={data => (
                <Item
                  key={data.id}
                  data={data.item}
                  separators={data.separators}
                  navigation={navigation}
                />
              )}
            />
          )}
        </QueryReducer>
      </Screen>
    )
  }
}
