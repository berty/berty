import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Flex } from '../../../Library'
import { colors } from '../../../../constants'
import { borderTop, padding } from '../../../../styles'
import { QueryReducer } from '../../../../relay'
import { queries, mutations } from '../../../../graphql'

export default class RequestValidation extends PureComponent {
  acceptRequest = async () => {
    try {
      const contactID = this.props.navigation.getParam('id')
      await mutations.contactAcceptRequest.commit({ contactID })
      this.props.navigation.goBack(null)
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const contactID = this.props.navigation.getParam('id')
    return (
      <QueryReducer query={queries.GetContact} variables={{ contactID }}>
        {(state, retry) => (
          <Flex.Cols
            size={1}
            style={[{ backgroundColor: colors.white }, borderTop]}
          >
            <Flex.Rows size={1} align='center' space='evenly' style={[padding]}>
              <TouchableOpacity
                onPress={this.acceptRequest}
                style={[
                  {
                    borderRadius: 8,
                    height: 100,
                    width: 300,
                    backgroundColor: colors.blue,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text
                  style={[
                    {
                      fontSize: 30,
                      color: colors.white,
                    },
                  ]}
                >
                  Accept
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log('Decline')}
                style={[
                  {
                    borderRadius: 8,
                    height: 100,
                    width: 300,
                    backgroundColor: colors.red,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text
                  style={[
                    {
                      fontSize: 30,
                      color: colors.white,
                    },
                  ]}
                >
                  Decline
                </Text>
              </TouchableOpacity>
            </Flex.Rows>
          </Flex.Cols>
        )}
      </QueryReducer>
    )
  }
}
