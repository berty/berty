import { ActivityIndicator, Image } from 'react-native'
import React, { PureComponent } from 'react'

import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

import { Flex, Screen, Text } from '../../../Library'
import { Pagination, RelayContext } from '../../../../relay'
import { borderBottom, padding } from '../../../../styles'
import { colors } from '../../../../constants'
import { fragments } from '../../../../graphql'
import { merge } from '../../../../helpers'

const Item = fragments.Contact(
  class Item extends PureComponent {
    static contextType = RelayContext

    static isLoading = {}

    onResend = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await this.props.screenProps.context.mutations.contactRequest({
          contact: this.props.data,
          introText: '',
        })
      } catch (err) {
        console.error(err)
      }
      Item.isLoading[id] = false
      this.forceUpdate()
    }

    onAccept = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await this.props.screenProps.context.mutations.contactAcceptRequest({
          id,
        })
      } catch (err) {
        console.error(err)
      }
      Item.isLoading[id] = false
      this.forceUpdate()
    }

    onDecline = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await this.props.screenProps.context.mutations.contactRemove({ id })
      } catch (err) {
        console.error(err)
      }
      Item.isLoading[id] = false
    }

    onRemove = async () => {
      const { id } = this.props.data
      Item.isLoading[id] = true
      this.forceUpdate()
      try {
        await this.props.screenProps.context.mutations.contactRemove({ id })
      } catch (err) {
        console.error(err)
      }
      Item.isLoading[id] = false
    }

    render () {
      const {
        data: { id, overrideDisplayName, displayName },
        navigation,
      } = this.props
      return (
        <Flex.Cols
          align='center'
          style={[{ height: 72 }, padding, borderBottom]}
        >
          <Flex.Cols size={4} justify='start'>
            <Image
              style={{ width: 40, height: 40, borderRadius: 20, margin: 4 }}
              source={{
                uri: 'https://api.adorable.io/avatars/40/' + id + '.png',
              }}
            />
            <Flex.Rows>
              <Text color={colors.black} left middle margin={{ left: 16 }}>
                {overrideDisplayName || displayName}
              </Text>
            </Flex.Rows>
          </Flex.Cols>
          {Item.isLoading[id] && (
            <Flex.Cols size={1} justify='end'>
              <ActivityIndicator />
            </Flex.Cols>
          )}
          {!Item.isLoading[id] &&
            (navigation.state.routeName === 'Received' ? (
              <Flex.Cols size={4}>
                <Text
                  icon='check'
                  background={colors.blue}
                  color={colors.white}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  shadow
                  tiny
                  rounded={22}
                  onPress={this.onAccept}
                >
                  ACCEPT
                </Text>
                <Text
                  icon='x'
                  background={colors.white}
                  color={colors.subtleGrey}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  tiny
                  shadow
                  self='end'
                  rounded={22}
                  onPress={this.onDecline}
                >
                  DECLINE
                </Text>
              </Flex.Cols>
            ) : (
              <Flex.Cols size={4}>
                <Text
                  icon='send'
                  background={colors.green}
                  color={colors.white}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  shadow
                  tiny
                  rounded={22}
                  onPress={this.onResend}
                >
                  RESEND
                </Text>
                <Text
                  icon='x'
                  background={colors.white}
                  color={colors.subtleGrey}
                  margin={{ left: 8 }}
                  padding={{
                    vertical: 6,
                    horizontal: 4,
                  }}
                  middle
                  center
                  tiny
                  shadow
                  self='end'
                  rounded={22}
                  onPress={this.onRemove}
                >
                  REMOVE
                </Text>
              </Flex.Cols>
            ))}
        </Flex.Cols>
      )
    }
  }
)

class Received extends PureComponent {
  render () {
    const { navigation, screenProps } = this.props
    const { queries, subscriptions } = screenProps.context
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Pagination
          direction='forward'
          query={queries.ContactList.graphql}
          variables={merge([
            queries.ContactList.defaultVariables,
            { filter: { status: 4 } },
          ])}
          fragment={fragments.ContactList}
          alias='ContactList'
          subscriptions={[
            subscriptions.contactRequest,
            subscriptions.contactRequestAccepted,
          ]}
          renderItem={props => (
            <Item
              {...props}
              navigation={navigation}
              screenProps={screenProps}
            />
          )}
        />
      </Screen>
    )
  }
}

class Sent extends PureComponent {
  render () {
    const { navigation, screenProps } = this.props
    const { queries, subscriptions } = screenProps.context
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Pagination
          direction='forward'
          query={queries.ContactList.graphql}
          variables={merge([
            queries.ContactList.defaultVariables,
            { filter: { status: 3 } },
          ])}
          fragment={fragments.ContactList}
          alias='ContactList'
          subscriptions={[
            subscriptions.contactRequest,
            subscriptions.contactRequestAccepted,
          ]}
          renderItem={props => (
            <Item
              {...props}
              navigation={navigation}
              screenProps={screenProps}
            />
          )}
        />
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    Received,
    Sent,
  },
  {
    initialRouteName: 'Received',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'top',

    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.black,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  }
)
