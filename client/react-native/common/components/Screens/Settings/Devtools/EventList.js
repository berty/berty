import { ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native'
import React, { PureComponent } from 'react'

import { FilterModal, PickerFilter } from '../../../Library/Filters'
import {
  Flex,
  Header,
  Screen,
  SearchBar,
  Separator,
  Icon,
  Text as LibText,
} from '../../../Library'
import { QueryReducer } from '../../../../relay'
import { colors } from '../../../../constants'
import { fragments, queries } from '../../../../graphql'
import { marginLeft, padding } from '../../../../styles'

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
          {data.ackedAt !== null
            ? <Icon name={'check-circle'} color={colors.green} />
            : <Icon name={'arrow-up-circle'} color={colors.orange} />
          }
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
            entry.createdAt.toLowerCase().indexOf(search.toLowerCase()) > -1,
        )
      }
    }

    onEndReached = () => {
      if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
        return
      }
      this.props.relay.loadMore(10, console.error)
    }

    refetch = () => {
      this.props.relay.refetchConnection(10, console.error, {
        ...queries.EventList.defaultVariables,
        ...this.props.navigation.getParam('filters'),
      })
    }

    componentDidMount () {
      this.props.navigation.setParams({
        searchHandler: this.searchHandler,
        retry: this.refetch,
      })
    }

    componentWillUnmount () {}

    render () {
      const { data, navigation } = this.props
      return (
        <FlatList
          data={data.EventList.edges || []}
          ItemSeparatorComponent={({ highlighted }) => (
            <Separator highlighted={highlighted} />
          )}
          onEndReached={this.onEndReached}
          refreshing={this.props.relay.isLoading()}
          onRefresh={this.refetch}
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
  },
)
export default class EventList extends PureComponent {
  componentWillMount () {
    this.props.navigation.setParams({
      filters: {
        onlyWithoutAckedAt: 0,
      },
    })
  }

  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <Header
          navigation={navigation}
          title='List events'
          titleIcon='list'
          searchBar={
            <SearchBar onChangeText={navigation.getParam('searchHandler')}>
              <LibText
                size={0}
                height={34}
                icon='filter'
                padding
                middle
                large
                onPress={() =>
                  navigation.push('modal/devtools/event/list/filters', {
                    defaultData: navigation.getParam('filters'),
                    onSave: filters => navigation.setParams({ filters }),
                  })
                }
              />
            </SearchBar>
          }
          backBtn
        />
      ),
    }
  }

  render () {
    const { navigation } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <QueryReducer
          query={queries.EventList}
          variables={{
            ...queries.EventList.defaultVariables,
            ...navigation.getParam('filters'),
          }}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return (
                  <Flex.Rows>
                    <ActivityIndicator size='large' />
                  </Flex.Rows>
                )
              case state.success:
                return <List data={state.data} navigation={navigation} />
              case state.error:
                return null
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export const EventListFilterModal = ({ navigation }) =>
  <FilterModal title={'Filter events'} navigation={navigation} defaultData={navigation.getParam('defaultData')}>
    <PickerFilter
      name='onlyWithoutAckedAt'
      choices={[
        { value: 0, label: 'All values' },
        { value: 1, label: 'AckedAt is not defined' },
        { value: 2, label: 'AckedAt is defined' },
      ]}
    />
  </FilterModal>
