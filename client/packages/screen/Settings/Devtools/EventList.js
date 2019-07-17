import { FilterModal, PickerFilter } from '@berty/component/Filters'
import {
  Flex,
  Header,
  Icon,
  SearchBar,
  OptimizedFlatList,
  Text as LibText,
  Loader,
} from '@berty/component'
import { borderBottom, marginLeft, padding } from '@berty/common/styles'
import { colors } from '@berty/common/constants'
import Button from '@berty/component/Button'
import React, { PureComponent } from 'react'
import * as enums from '@berty/common/enums.gen'
import { Store } from '@berty/container'
import { withNavigation } from 'react-navigation'
import { Text, TouchableOpacity, View } from 'react-native'
import moment from 'moment'

export const Item = ({ data, navigation }) => (
  <TouchableOpacity
    onPress={() => {
      navigation.navigate('devtools/eventdetails', { details: data })
    }}
    style={[
      {
        backgroundColor: colors.white,
        height: 72,
      },
      padding,
      borderBottom,
    ]}
  >
    <Flex.Cols align="center">
      <Flex.Rows size={7} align="stretch" justify="center" style={[marginLeft]}>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          className="textEllipsis"
          style={{ color: colors.black }}
        >
          {data.ackedAt !== null ? (
            <Icon name={'check-circle'} color={colors.green} />
          ) : (
            <Icon name={'arrow-up-circle'} color={colors.red} />
          )}{' '}
          {
            {
              0: <Icon name={'check-circle'} color={colors.red} />,
              1: <Icon name={'phone-incoming'} color={colors.orange} />,
              2: <Icon name={'phone-outgoing'} color={colors.purple} />,
            }[data.direction]
          }{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {enums.ValueBertyEntityKindInputKind[data.kind]}
          </Text>
          {' (' + data.kind + ')'}
        </Text>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          className="textEllipsis"
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>ID</Text>
          {' ' + data.id}
        </Text>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          className="textEllipsis"
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>Created</Text>
          {` ${moment(data.createdAt).fromNow()} ${data.createdAt}`}
        </Text>
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          className="textEllipsis"
          style={{ color: colors.blackGrey, fontSize: 12 }}
        >
          <Text style={{ fontWeight: 'bold' }}>Acked</Text>
          {data.ackedAt
            ? ` ${moment(data.ackedAt).fromNow()} ${data.ackedAt}`
            : ' never'}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  </TouchableOpacity>
)

@withNavigation
class EventList extends PureComponent {
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

  componentWillMount() {
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
          title="List events"
          titleIcon="list"
          backBtn
        />
      ),
    }
  }

  renderItem = ({ item: data }) => (
    <Item data={data} navigation={this.props.navigation} />
  )

  render() {
    const { navigation } = this.props
    return (
      <Store.Node.Service.EventList.Pagination
        paginate={({ cursor }) => ({
          first: 50,
          after: cursor,
          sortedBy: 'created_at',
        })}
        {...navigation.getParam('filters')}
        fallback={<Loader />}
      >
        {({ queue, loading, paginate, retry }) => (
          <OptimizedFlatList
            data={queue}
            onEndReached={paginate}
            renderItem={this.renderItem}
            onRefresh={retry}
            refreshing={loading}
            ListHeaderComponent={
              <View style={padding}>
                <SearchBar onChangeText={search => this.searchHandler(search)}>
                  <LibText
                    size={0}
                    height={34}
                    icon="filter"
                    padding
                    middle
                    large
                    onPress={() =>
                      navigation.navigate('modal/devtools/event/list/filters', {
                        defaultData: navigation.getParam('filters'),
                        onSave: filters => navigation.setParams({ filters }),
                      })
                    }
                  />
                </SearchBar>
              </View>
            }
          />
        )}
      </Store.Node.Service.EventList.Pagination>
    )
  }
}

export class EventListFilterModal extends PureComponent {
  render() {
    const { navigation } = this.props
    return (
      <FilterModal
        title={'Filter events'}
        navigation={navigation}
        defaultData={navigation.getParam('defaultData')}
      >
        <PickerFilter
          name="onlyWithoutAckedAt"
          choices={[
            { value: 0, label: 'All values' },
            { value: 1, label: 'AckedAt is not defined' },
            { value: 2, label: 'AckedAt is defined' },
          ]}
        />
        <Button
          onPress={() =>
            this.props.context.mutations.debugRequeueAll({
              t: true,
            })
          }
          icon={'radio'}
          style={{ textAlign: 'left' }}
        >
          Requeue all non acked
        </Button>
      </FilterModal>
    )
  }
}

export default EventList
