import React, { PureComponent } from 'react'
import {
  View,
  Text,
  InteractionManager,
  TouchableOpacity,
  Platform,
  FlatList as FlatListWeb,
} from 'react-native'
import { FlatList } from 'react-navigation'
import { Screen, Icon, EmptyList, Loader } from '@berty/component'
import { colors } from '@berty/common/constants'
import { Item } from './Item'
import I18n from 'i18next'
import { Store } from '@berty/container'
import { withStoreContext } from '@berty/store/context'

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
    length: GenericList.ITEM_HEIGHT,
    offset: GenericList.ITEM_HEIGHT * index,
    index,
  })

  keyExtractor = item => item.id

  shouldItemUpdate = (props, nextProps) => {
    if (props.data.status !== nextProps.data.status) {
      return true
    }
    return false
  }

  static List = Platform.OS === 'web' ? FlatListWeb : FlatList

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

  renderList = ({ queue, paginate, count, loading, retry }) => {
    if (count) {
      return (
        <>
          <GenericList.List
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
            extraData={count}
            renderItem={this.renderItem}
            refreshing={count === 0 && loading}
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

  render() {
    const { didFinishInitialAnimation } = this.state
    if (!didFinishInitialAnimation) {
      return null
    }
    const { paginate, filter } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Store.Node.Service.ContactList.Pagination
          filter={{ ...((filter && filter.filter) || {}) }}
          paginate={({ cursor, count }) => ({
            first: count ? 50 : 50,
            after: cursor,
            ...(paginate || {}),
          })}
          fallback={<Loader />}
        >
          {this.renderList}
        </Store.Node.Service.ContactList.Pagination>
      </Screen>
    )
  }
}

export default GenericList
