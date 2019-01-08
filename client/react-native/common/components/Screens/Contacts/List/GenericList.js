import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import { Screen, Icon, EmptyList } from '../../../Library'
import { colors } from '../../../../constants'
import { Pagination } from '../../../../relay'
import { merge } from '../../../../helpers'
import { fragments } from '../../../../graphql'
import Item from './Item'
import RelayContext from '../../../../relay/RelayContext'
import I18n from 'i18next'

const cond = (data) => data && data.edges.length < 5

class CondComponent extends PureComponent {
  state = {
    fontWidth: 0,
  }

  render () {
    const fontSize = 0.05 * this.state.fontWidth

    return (
      <View style={{
        backgroundColor: colors.blue,
        borderRadius: 25,
        marginBottom: 30,
        marginTop: 'auto',
        width: '51%',
        alignSelf: 'center',
        paddingHorizontal: 14,
        minHeight: '7%',
      }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onLayout={(e) => this.setState({ fontWidth: e.nativeEvent.layout.width })}
        >
          <Icon style={{ color: colors.white }} name={'user-plus'} />
          <Text style={{ fontSize: fontSize, textTransform: 'uppercase', color: colors.white, display: 'flex', textAlign: 'center', flex: 1, flexDirection: 'column', justifyContent: 'center' }} >{I18n.t('contacts.add.title')}</Text>
        </View>
      </View>
    )
  }
}

const GenericList = ({ filter, ignoreMyself, onPress }) => (
  <RelayContext.Consumer>
    {context => {
      const { queries, subscriptions } = context

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
            condComponent={() => <CondComponent />}
            emptyItem={() => <EmptyList
              source={require('../../../../static/img/empty-contact.png')}
              text={I18n.t('contacts.empty')}
              icon={'user-plus'}
              btnText={I18n.t('contacts.add.title')}
              onPress={() => onPress()}
            />}
          />
        </Screen>
      )
    }}
  </RelayContext.Consumer>
)

export default GenericList
