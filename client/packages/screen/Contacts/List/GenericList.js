import React, { PureComponent } from 'react'
import {
  View,
  Text,
  InteractionManager,
  TouchableOpacity,
  Platform,
} from 'react-native'
import {
  OptimizedFlatList,
  Screen,
  Icon,
  EmptyList,
  Loader,
} from '@berty/component'
import { colors } from '@berty/common/constants'
import { Item } from './Item'
import I18n from 'i18next'
import { Store } from '@berty/container'
import { withStoreContext } from '@berty/store/context'
import { NavigationEvents, withNavigation } from 'react-navigation'
import tDate from '@berty/common/helpers/timestampDate'

class CondComponent extends PureComponent {
  state = {
    fontWidth: 0,
  }

  render() {
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

@withNavigation
@withStoreContext
class List extends React.Component {
  focus = this.props.navigation.routeName === 'mutuals'

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

  static ITEM_HEIGHT = (() => {
    switch (Platform.OS) {
      case 'web':
        // eslint-disable-next-line
        return __DEV__ ? 80.5 : 72
      case 'android':
      case 'ios':
      default:
        return 72
    }
  })()

  getItemLayout = (data, index) => ({
    length: List.ITEM_HEIGHT,
    offset: List.ITEM_HEIGHT * index,
    index,
  })

  keyExtractor = item => item.id

  shouldItemUpdate = (props, nextProps) => {
    if (props.data.status !== nextProps.data.status) {
      return true
    }
    return false
  }

  lastIndex = null

  onScroll = paginate => {
    return e => {
      if (this.lastIndex) {
        if (
          e.nativeEvent.contentOffset.y > this.lastIndex &&
          e.nativeEvent.contentOffset.y >
            e.nativeEvent.contentSize.height * 0.666
        ) {
          paginate()
        }
      }
      this.lastIndex = e.nativeEvent.contentOffset.y
    }
  }

  lastViewableItemsChanged = () => {}
  onViewableItemsChanged = ({ viewableItems }) => {
    if (
      ['mutuals', 'received'].some(
        _ => _ === this.props.navigation.state.routeName
      )
    ) {
      this.lastViewableItemsChanged = () =>
        viewableItems.forEach(
          ({ item: { id, status, seenAt, mutatedAt }, isViewable }) => {
            if (
              isViewable &&
              status === 4 &&
              tDate(mutatedAt).getTime() > tDate(seenAt).getTime()
            ) {
              this.props.context.node.service.contactSeen({
                id,
              })
            }
          }
        )
    }
    if (this.focus) {
      this.lastViewableItemsChanged()
    }
  }

  render() {
    const {
      queue,
      paginate,
      retry,
      infos: { count, cursor, loading },
      onPress,
    } = this.props
    return (
      <>
        <NavigationEvents
          onWillFocus={payload => {
            this.focus = true
            this.lastViewableItemsChanged()
          }}
          onWillBlur={payload => {
            this.focus = false
          }}
        />
        {count ? (
          <>
            <OptimizedFlatList
              windowSize={11}
              initialNumToRender={50}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={64}
              onScroll={this.onScroll(paginate)}
              scrollEventThrottle={128}
              onEndReached={this.paginate}
              data={queue}
              getItemLayout={this.getItemLayout}
              keyExtractor={this.keyExtractor}
              extraData={cursor}
              renderItem={this.renderItem}
              refreshing={loading}
              onRefresh={Platform.OS !== 'web' && retry}
              onViewableItemsChanged={this.onViewableItemsChanged}
            />
            {count < 5 ? <CondComponent onPress={onPress} /> : null}
          </>
        ) : (
          <EmptyList
            source={require('@berty/common/static/img/empty-contact.png')}
            text={I18n.t('contacts.empty')}
            icon={'user-plus'}
            btnText={I18n.t('contacts.add.title')}
            onPress={this.props.onPress}
          />
        )}
      </>
    )
  }
}

@withStoreContext
class GenericList extends React.Component {
  state = {
    didFinishInitialAnimation: false,
  }

  componentDidMount() {
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

  componentWillUnmount() {
    InteractionManager.clearInteractionHandle(this.handler)
    this.setState({
      didFinishInitialAnimation: false,
    })
  }

  render() {
    const { didFinishInitialAnimation } = this.state
    if (!didFinishInitialAnimation) {
      return null
    }
    const { paginate, filter, onPress } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Store.Node.Service.ContactList.Pagination
          filter={{ ...((filter && filter.filter) || {}) }}
          paginate={({ cursor, count }) => ({
            first: count ? 50 : 50,
            after: cursor,
            orderDesc: true,
            ...(paginate || {}),
          })}
          fallback={<Loader />}
        >
          {(queue, paginate, retry, infos) => (
            <List
              queue={queue}
              paginate={paginate}
              retry={retry}
              infos={infos}
              onPress={onPress}
            />
          )}
        </Store.Node.Service.ContactList.Pagination>
      </Screen>
    )
  }
}

export default GenericList
