import React, { PureComponent } from 'react'
import { FlatList as NavFlatList } from 'react-navigation'
import { FlatList as NatFlatList, Platform } from 'react-native'

const FlatList = Platform.OS === 'web' ? NatFlatList : NavFlatList

export class OptimizedFlatList extends PureComponent {
  lastIndex = null

  onRefresh = () => {
    if (this.props.onRefresh) {
      this.props.onRefresh()
      this.lastIndex = null
    }
  }

  onScroll = onEndReached => {
    return e => {
      if (this.lastIndex) {
        if (
          e.nativeEvent.contentOffset.y > this.lastIndex &&
          e.nativeEvent.contentOffset.y >
            e.nativeEvent.contentSize.height * 0.666
        ) {
          onEndReached()
        }
      }
      this.lastIndex = e.nativeEvent.contentOffset.y
    }
  }

  keyExtractor = (item, index) => item.id || index

  render () {
    const {
      data,
      onEndReached,
      refreshing,
      onRefresh,
      getItemLayout,
      renderItem,
      ...props
    } = this.props
    return (
      <FlatList
        windowSize={11}
        initialNumToRender={50}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={64}
        scrollEventThrottle={128}
        onScroll={this.onScroll(onEndReached)}
        keyExtractor={this.keyExtractor}
        onEndReached={onEndReached}
        getItemLayout={getItemLayout}
        data={data}
        extraData={data.length}
        refreshing={data.length === 0 && refreshing}
        onRefresh={Platform.OS !== 'web' && onRefresh}
        renderItem={renderItem}
        {...props}
      />
    )
  }
}

export default OptimizedFlatList
