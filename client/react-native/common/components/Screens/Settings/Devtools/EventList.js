import React, { PureComponent } from 'react'
import { TouchableOpacity, FlatList } from 'react-native'
import { Flex, Header, Screen, Separator, Text } from '../../../Library'
import { queries } from '../../../../graphql'
import { QueryReducer } from '../../../../relay'
import { colors } from '../../../../constants'
import { marginLeft, padding } from '../../../../styles'

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
        data={this.filter(data.EventList || [])}
        ItemSeparatorComponent={({ highlighted }) => (
          <Separator highlighted={highlighted} />
        )}
        onEndReached={this.onEndReached}
        refreshing={loading}
        onRefresh={retry}
        navigation={navigation}
        renderItem={data => (
          <TouchableOpacity
            onPress={() => {
              console.log(data.item)
              navigation.push('devtools/eventdetails', { details: data.item })
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
              <Flex.Rows
                size={7}
                align='stretch'
                justify='center'
                style={[marginLeft]}
              >
                <Text color={colors.black} left middle ellipsis>
                  <Text bold color={colors.black}>
                    Kind
                  </Text>
                  {' ' + data.item.kind}
                </Text>
                <Text tiny middle left ellipsis>
                  <Text tiny bold>
                    ID
                  </Text>
                  {' ' + data.item.id}
                </Text>
                <Text tiny middle left ellipsis>
                  <Text tiny bold>
                    Created
                  </Text>
                  {' ' + data.item.createdAt}
                </Text>
              </Flex.Rows>
            </Flex.Cols>
          </TouchableOpacity>
        )}
      />
    )
  }
}

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
        <QueryReducer query={queries.EventList}>
          {(state, retry) => (
            <Flex.Rows style={{ backgroundColor: colors.white }}>
              <List
                data={state.data}
                loading={state.type === state.loading}
                retry={retry}
                navigation={navigation}
              />
            </Flex.Rows>
          )}
        </QueryReducer>
      </Screen>
    )
  }
}
