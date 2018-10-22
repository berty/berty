import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Screen, Separator } from '../../../Library'
import { QueryReducer } from '../../../../relay'
import { colors } from '../../../../constants'
import { marginLeft, padding } from '../../../../styles'
import { queries, fragments } from '../../../../graphql'

const Item = fragments.Event(({ data, navigation }) => (
  <TouchableOpacity
    onPress={() => {
      navigation.push('devtools/eventdetails', { details: data })
    }}
    style={[
      {
        backgroundColor: colors.white,
        height: 72,
      },
      padding,
    ]}
  >
    <Flex.Cols align='center'>
      <Flex.Rows size={7} align='stretch' justify='center' style={[marginLeft]}>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.black }}
        >
          <Text style={{ fontWeight: 'bold' }}>Kind</Text>
          {' ' + data.kind}
        </Text>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>ID</Text>
          {' ' + data.id}
        </Text>
        <Text
          ellipsizeMode='tail'
          numberOfLines={1}
          className='textEllipsis'
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>Created</Text>
          {' ' + data.createdAt}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
))

const List = fragments.EventList(
  class List extends PureComponent {
    onEndReached = () => {}

    state = {
      search: '',
    }

    searchHandler = search => this.setState({ search })

    filter = EventList => {
      const { search } = this.state
      if (search === '') {
        return EventList
      } else {
        return EventList.filter(
          entry =>
            entry.id.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            entry.kind.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            entry.createdAt.toLowerCase().indexOf(search.toLowerCase()) > -1
        )
      }
    }

    componentDidMount () {
      this.props.navigation.setParams({ searchHandler: this.searchHandler })
      this.props.navigation.setParams({
        searchHandler: this.searchHandler,
        retry: () => this.props.retry && this.props.retry(),
      })
    }

    componentWillUnmount () {}

    render () {
      const { data, retry, loading, navigation } = this.props
      return (
        <FlatList
          data={this.filter(data.EventList.edges || [])}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          onEndReached={this.onEndReached}
          refreshing={loading}
          onRefresh={retry}
          navigation={navigation}
          renderItem={data => (
            <Item
              key={data.item.node.id}
              data={data.item.node}
              navigation={navigation}
            />
          )}
        />
      )
    }
  }
)
export default class EventList extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='List events'
        titleIcon='list'
        searchBar
        searchHandler={navigation.getParam('searchHandler')}
        backBtn
      />
    ),
  })
  render () {
    const { navigation } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <QueryReducer
          query={queries.EventList}
          variables={queries.EventList.defaultVariables}
        >
          {(state, retry) => {
            console.log(state)
            switch (state.type) {
              default:
              case state.loading:
                return (
                  <Flex.Rows>
                    <ActivityIndicator size='large' />
                  </Flex.Rows>
                )
              case state.success:
                return (
                  <List
                    data={state.data}
                    loading={state.type === state.loading}
                    retry={retry}
                    navigation={navigation}
                  />
                )
              case state.error:
                return null
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}
