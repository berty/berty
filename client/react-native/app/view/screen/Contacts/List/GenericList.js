import React, { PureComponent } from 'react'
import { View, Text, InteractionManager, TouchableOpacity } from 'react-native'
import { Screen, Icon, EmptyList } from '@berty/view/component'
import { colors } from '@berty/common/constants'
import { Pagination } from '@berty/relay'
import { merge } from '@berty/common/helpers'
import withRelayContext from '@berty/common/helpers/withRelayContext'
import { fragments } from '@berty/graphql'
import Item from './Item'
import I18n from 'i18next'

const cond = data => data && data.edges.length < 5

class CondComponent extends PureComponent {
  state = {
    fontWidth: 0,
  }

  render () {
    const fontSize = this.state.fontWidth * 0.07
    const { onPress } = this.props

    return (
      <View
        style={{
          backgroundColor: colors.blue,
          borderRadius: 25,
          marginBottom: 30,
          marginTop: 'auto',
          width: '51%',
          alignSelf: 'center',
          paddingHorizontal: 14,
          minHeight: '7%',
        }}
      >
        <TouchableOpacity
          onPress={() => onPress()}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onLayout={e =>
            this.setState({ fontWidth: e.nativeEvent.layout.width })
          }
        >
          <Icon style={{ color: colors.white }} name={'user-plus'} />
          <Text
            style={{
              fontSize: fontSize,
              color: colors.white,
              display: 'flex',
              textAlign: 'center',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {I18n.t('contacts.add.title').toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class GenericList extends React.Component {
  state = {
    didFinishInitialAnimation: false,
  }

  componentDidMount () {
    this.handler = InteractionManager.runAfterInteractions(() => {
      // 4: set didFinishInitialAnimation to false
      // This will render the navigation bar and a list of players
      this.setState({
        didFinishInitialAnimation: true,
      })
    })
  }

  // shouldComponentUpdate (nextProps, nextState) {
  //   console.log('nextProps', nextProps)
  //   // if (nextProps.navigation.isFocused() === true) {
  //   //   return true
  //   // }
  //   return true
  // }

  componentWillUnmount () {
    InteractionManager.clearInteractionHandle(this.handler)
    this.setState({
      didFinishInitialAnimation: false,
    })
  }

  render () {
    const { didFinishInitialAnimation } = this.state
    if (!didFinishInitialAnimation) {
      return null
    }
    const {
      filter,
      ignoreMyself,
      onPress,
      context: { queries, subscriptions },
      context,
    } = this.props

    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Pagination
          direction='forward'
          query={queries.ContactList.graphql}
          variables={merge([queries.ContactList.defaultVariables, filter])}
          fragment={fragments.ContactList}
          alias='ContactList'
          subscriptions={[subscriptions.contact]}
          renderItem={props => (
            <Item {...props} context={context} ignoreMyself={ignoreMyself} />
          )}
          cond={cond}
          condComponent={() => <CondComponent onPress={() => onPress()} />}
          emptyItem={() => (
            <EmptyList
              source={require('@berty/common/static/img/empty-contact.png')}
              text={I18n.t('contacts.empty')}
              icon={'user-plus'}
              btnText={I18n.t('contacts.add.title')}
              onPress={() => onPress()}
            />
          )}
        />
      </Screen>
    )
  }
}

export default withRelayContext(GenericList)
