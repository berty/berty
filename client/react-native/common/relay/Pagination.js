import { ActivityIndicator, FlatList } from 'react-native'
import React, { PureComponent } from 'react'
import Relay from 'react-relay'

import { Flex } from '../components/Library'
import { QueryReducer } from '.'

class PaginationContainer extends PureComponent {
  componentDidMount () {
    this.props.subscribers && this.props.subscribers.forEach(s => s.subscribe())
  }

  componentWillUnmount () {
    this.props.subscribers &&
      this.props.subscribers.forEach(s => s.unsubscribe())
  }

  onEndReached = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return
    }
    this.props.relay.loadMore(
      (this.props.variables && this.props.variables.count) || 10,
      err => err && console.error(err)
    )
  }

  refetch = () => {
    const { relay, data, connection } = this.props
    const edges =
      data[connection] && data[connection].edges ? data[connection].edges : []

    relay.refetchConnection(edges.length, err => err && console.error(err))
  }

  keyExtractor = item => item.node.id

  render () {
    const { data, connection, relay, renderItem, inverted, style } = this.props
    return (
      <FlatList
        data={
          data[connection] && data[connection].edges
            ? data[connection].edges
            : []
        }
        inverted={inverted}
        refreshing={relay.isLoading()}
        onRefresh={this.refetch}
        onEndReached={this.onEndReached}
        keyExtractor={this.keyExtractor}
        renderItem={({ item: { node } }) => renderItem({ data: node })}
        style={style}
      />
    )
  }
}

const createPagination = ({
  children,
  direction = 'forward',
  fragment,
  connection,
  query,
}) =>
  Relay.createPaginationContainer(PaginationContainer, fragment, {
    direction,
    getConnectionFromProps: props => {
      return props.data[connection]
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
    const { subscriptions = [] } = this.props
    this.subscribers = subscriptions.map(s => s.subscribe())
  }

  componentWillUnmount () {
    this.subscribers.forEach(s => s.unsubscribe())
  }

  render () {
    const { query, variables } = this.props

    const Container = createPagination(this.props)

    return (
      <QueryReducer query={query} variables={variables}>
        {(state, retry) => {
          switch (state.type) {
            default:
            case state.loading:
              return (
                <Flex.Rows align='center'>
                  <Flex.Cols align='center'>
                    <ActivityIndicator size='large' />
                  </Flex.Cols>
                </Flex.Rows>
              )
            case state.success:
              return <Container {...state} retry={retry} {...this.props} />
            case state.error:
              return null
          }
        }}
      </QueryReducer>
    )
  }
}
