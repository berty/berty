import { ActivityIndicator, FlatList } from 'react-native'
import React, { Component, PureComponent } from 'react'
import Relay from 'react-relay'

import { Flex } from '../components/Library'
import { QueryReducer } from '.'
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

  keyExtractor = item => item.node.id

  renderItem = ({ item: { node } }) => this.props.renderItem({ data: node })

  render () {
    const { data, alias, renderItem, inverted, style } = this.props
    return (
      <FlatList
        data={data[alias] && data[alias].edges ? data[alias].edges : []}
        inverted={inverted}
        refreshing={this.state.refetching}
        onRefresh={this.refetch}
        onEndReached={this.onEndReached}
        keyExtractor={this.keyExtractor}
        renderItem={renderItem && this.renderItem}
        style={style}
      />
    )
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
