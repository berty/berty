import { ActivityIndicator, FlatList, View } from 'react-native'
import React, { Component, PureComponent } from 'react'
import Relay from 'react-relay'

import QueryReducer from './QueryReducer'
import genericUpdater from './genericUpdater'

class PaginationContainer extends Component {
  state = {
    refetching: false,
    loadingMore: false,
  }

  onEndReached = () => {
    const { relay } = this.props
    const { refetching, loadingMore } = this.state

    if (refetching || loadingMore || !relay.hasMore() || relay.isLoading()) {
      return
    }

    this.setState({ loadingMore: true }, () => {
      this.props.relay.loadMore(
        (this.props.variables && this.props.variables.count) || 10,
        err => {
          err && console.error(err)
          this.setState({ loadingMore: false })
        }
      )
    })
  }

  refetch = () => {
    const { relay, alias, data } = this.props
    const { refetching, loadingMore } = this.state

    if (refetching || loadingMore || relay.isLoading()) {
      return
    }
    this.setState({ refetching: true }, () => {
      const edges = data[alias] && data[alias].edges ? data[alias].edges : []

      relay.refetchConnection(edges.length, err => {
        err && console.error(err)
        this.setState({ refetching: false })
      })
    })
  }

  keyExtractor = item => item.node.cursor + ':' + item.node.id

  renderItem = ({ item: { node }, index, ...props }) =>
    this.props.renderItem({ data: node, index, ...props })

  scrollToIndex = index => {
    index && this._list && this._list.scrollToIndex({ index })
  }

  render () {
    const {
      data,
      alias,
      renderItem,
      inverted,
      style,
      emptyItem,
      cond,
      condComponent,
      ListComponent = FlatList,
    } = this.props

    if (!emptyItem || (data[alias] && data[alias].edges.length > 0)) {
      return (
        <>
          <ListComponent
            ListHeaderComponent={this.props.ListHeaderComponent}
            ListEmptyComponent={this.props.ListEmptyComponent}
            data={data[alias].edges}
            inverted={inverted}
            refreshing={this.state.refetching}
            onRefresh={this.refetch}
            onEndReached={this.onEndReached}
            getItemLayout={this.props.getItemLayout}
            keyExtractor={this.keyExtractor}
            renderItem={renderItem && this.renderItem}
            style={style}
            ref={list => (this._list = list)}
          />
          {cond != null && cond(data[alias]) && condComponent != null
            ? condComponent()
            : null}
        </>
      )
    }

    return emptyItem != null ? emptyItem() : null
  }
}

const createPagination = ({
  children,
  direction = 'forward',
  fragment,
  alias,
  query,
}) =>
  Relay.createPaginationContainer(PaginationContainer, fragment, {
    direction,
    getConnectionFromProps: props => {
      return props.data[alias]
    },
    getFragmentVariables: (prevVars, totalCount) => {
      return {
        ...prevVars,
        count: totalCount,
      }
    },
    getVariables: (props, { count, cursor }, fragmentVariables) => {
      return { ...fragmentVariables, count, cursor }
    },
    query,
  })

export default class Pagination extends PureComponent {
  componentDidMount () {
    const { subscriptions = [], fragment, alias, variables } = this.props
    this.subscribers = subscriptions.map(s =>
      s.subscribe({
        updater: genericUpdater(fragment, alias, {
          ...variables,
          count: undefined,
          cursor: undefined,
        }),
      })
    )
  }

  componentWillUnmount () {
    this.subscribers.forEach(s => s.unsubscribe())
  }

  scrollToIndex = index => {
    this._container && this._container.scrollToIndex(index)
  }

  render () {
    const { query, variables, noLoader } = this.props

    const Container = createPagination(this.props)

    return (
      <QueryReducer query={query} variables={variables}>
        {(state, retry) => {
          switch (state.type) {
            default:
            case state.loading:
              return noLoader === true ? null : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <ActivityIndicator size='large' />
                  </View>
                </View>
              )
            case state.success:
              return (
                <Container
                  {...state}
                  retry={retry}
                  {...this.props}
                  ref={container => (this._container = container)}
                />
              )
            case state.error:
              return null
          }
        }}
      </QueryReducer>
    )
  }
}
