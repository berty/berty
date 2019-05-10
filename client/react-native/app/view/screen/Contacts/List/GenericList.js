import React, { PureComponent, Fragment } from 'react'
import {
  View,
  Text,
  InteractionManager,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native'
import { Screen, Icon, EmptyList, Loader } from '@berty/view/component'
import { colors } from '@berty/common/constants'
import { Pagination } from '@berty/relay'
import { merge } from '@berty/common/helpers'
import withRelayContext from '@berty/common/helpers/withRelayContext'
import { fragments } from '@berty/graphql'
import { Item } from './Item'
import I18n from 'i18next'
import { StoreContainer as Store } from '@berty/store/container.gen'
import { withContext as withStoreContext } from '@berty/store/context'

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

@withStoreContext
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

  renderItem = (
    { item: data, index },
    { onPress, ignoreMyself } = this.props
  ) => (
    <Item
      data={data}
      context={this.props.context}
      onPress={onPress}
      ignoreMyself={ignoreMyself}
    />
  )

  getItemLayout = (data, index) => ({
    length: 80.5,
    offset: 80.5 * index,
    index,
  })

  keyExtractor = item => item.id

  renderList = ({ queue, paginate, count, loading, retry }) => {
    if (count) {
      return (
        <>
          <FlatList
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            data={queue}
            windowSize={3}
            getItemLayout={this.getItemLayout}
            keyExtractor={this.keyExtractor}
            extraData={count}
            onEndReached={paginate}
            onEndReachedThreshold={1}
            renderItem={this.renderItem}
            onRefresh={Platform.OS !== 'web' && retry}
          />
          {count < 5 ? <CondComponent onPress={this.props.onPress} /> : null}
        </>
      )
    }
    return (
      <EmptyList
        source={require('@berty/common/static/img/empty-contact.png')}
        text={I18n.t('contacts.empty')}
        icon={'user-plus'}
        btnText={I18n.t('contacts.add.title')}
        onPress={this.props.onPress}
      />
    )
  }

  render () {
    const { didFinishInitialAnimation } = this.state
    if (!didFinishInitialAnimation) {
      return null
    }
    const { filter } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Store.Node.Service.ContactList.Pagination
          filter={{ ...((filter && filter.filter) || {}) }}
          paginate={({ cursor, count }) => ({
            first: count ? 50 : 20,
            after: cursor,
          })}
          fallback={<Loader />}
        >
          {this.renderList}
        </Store.Node.Service.ContactList.Pagination>
      </Screen>
    )
  }
}

export class GenericMobxList extends PureComponent {
  render () {
    return <Screen style={[{ backgroundColor: colors.white }]} />
  }
}

export default GenericList
