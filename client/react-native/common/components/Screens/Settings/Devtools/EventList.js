import { ActivityIndicator, FlatList, Text, TouchableOpacity } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Icon, Screen, SearchBar, Separator } from '../../../Library'
import { QueryReducer } from '../../../../relay'
import { colors } from '../../../../constants'
import { marginLeft, padding } from '../../../../styles'
import { fragments, queries } from '../../../../graphql'
import { FilterModal, PickerFilter } from '../../../Library/Filters'

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
            entry.createdAt.toLowerCase().indexOf(search.toLowerCase()) > -1,
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
  },
)
export default class EventList extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      filters: {},
    }
  }

  componentWillMount () {
    this.props.navigation.setParams({
      component: this,
    })
  }

  static navigationOptions ({ navigation }) {
    return {
      header: (
        <Header
          navigation={navigation}
          title='List events'
          titleIcon='list'
          searchBar={
            <SearchBar onChangeText={navigation.getParam('searchHandler')}>
              <TouchableOpacity onPress={() => {
                navigation.push('modal/devtools/event/list/filters', {
                  defaultData: navigation.getParam('component').state.filters,
                  onSave: filters => navigation.getParam('component').setState({ filters: filters }),
                })
              }}>
                <Icon name={'filter'} style={{ fontSize: 24 }} />
              </TouchableOpacity>
            </SearchBar>
          }
          backBtn
        />
      ),
    }
  }

  render () {
    console.log(['EventListFilter', {
      ...queries.EventList.defaultVariables,
      ...this.state.filters,
    }])

    const { navigation } = this.props
    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <QueryReducer
          query={queries.EventList}
          variables={{
            ...queries.EventList.defaultVariables,
            ...this.state.filters,
          }}
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

export const EventListFilterModal = ({ navigation }) =>
  <FilterModal title={'Filter events'} navigation={navigation} defaultData={navigation.getParam('defaultData')}>
    <PickerFilter
      name='onlyWithoutAckedAt'
      choices={[
        { value: 0, label: 'All values' },
        { value: 1, label: 'Acked at is defined' },
        { value: 2, label: 'Acked at is not defined' },
      ]} />
  </FilterModal>
