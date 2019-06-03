import { FlatList, View } from 'react-native'
import React from 'react'

import { Avatar, Flex, ModalScreen } from '@berty/component'
import { withRelayContext } from '@berty/relay/context'
import Text from '@berty/component/Text'
import { colors } from '@berty/common/constants'
import { withNamespaces } from 'react-i18next'
import { Pagination } from '@berty/relay'
import { fragments } from '@berty/graphql'
import { borderTop, marginLeft, padding } from '@berty/common/styles'
import { conversation as utils } from '@berty/relay/utils'
import Mousetrap from '@berty/common/helpers/Mousetrap'
import { withGoBack } from '@berty/component/BackActionProvider'
import {
  withNavigation,
  withNavigationFocus,
  StackActions,
  NavigationActions,
} from 'react-navigation'

const modalWidth = 480

const FilteredListContext = React.createContext()

class SwitcherListComponentBase extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      listProps: {
        query: '',
        focusedIndex: 0,
      },
    }

    this.candidateRoute = null
    this.matchedIndices = []
  }

  moveCursor (index, { scroll } = {}) {
    try {
      index = Math.min(index, this.props.data.length - 1)
      index = Math.max(index, 0)
      if (isNaN(index) || this.state.listProps.focusedIndex === index) {
        return
      }

      if (scroll) {
        const indexPos = this.matchedIndices
          .sort((a, b) => a - b)
          .indexOf(index)
        if (indexPos !== -1 && this._list) {
          this._list.scrollToIndex({
            index: indexPos,
            viewPosition: 1,
            animated: false,
          })
        } else {
          console.warn('attempted to reach index ', index)
        }
      }

      this.setState({
        listProps: {
          ...this.state.listProps,
          focusedIndex: index,
        },
      })
    } catch (e) {
      console.warn(e)
    }
  }

  enter () {
    if (!this.props.isFocused) {
      return
    }

    if (this.candidateRoute !== null) {
      this.props.navigation.navigate(this.candidateRoute)
    }
  }

  up (e) {
    if (!this.props.isFocused) {
      return
    }

    const index = this.matchedIndices
      .sort((a, b) => a - b)
      .indexOf(this.state.listProps.focusedIndex)
    if (index !== 0) {
      this.moveCursor(this.matchedIndices[index - 1], { scroll: true })
    }
    e.preventDefault()
  }

  down (e) {
    if (!this.props.isFocused) {
      return
    }

    const index = this.matchedIndices
      .sort((a, b) => a - b)
      .indexOf(this.state.listProps.focusedIndex)
    if (index !== this.state.listProps.focusedIndex.length - 1) {
      this.moveCursor(this.matchedIndices[index + 1], { scroll: true })
    }
    e.preventDefault()
  }

  setIndex (index) {
    this.moveCursor(index, {})
  }

  setCandidateRoute (route) {
    this.candidateRoute = route
  }

  componentDidMount () {
    if (
      this._up === undefined ||
      this._down === undefined ||
      this._enter === undefined
    ) {
      this._up = e => this.up(e)
      this._down = e => this.down(e)
      this._enter = e => this.enter(e)
    }

    Mousetrap.prototype.stopCallback = () => {}
    Mousetrap.bind(['up'], this._up)
    Mousetrap.bind(['down'], this._down)
    Mousetrap.bind(['enter'], this._enter)
  }

  componentWillUnmount () {
    Mousetrap.unbind(['up'], this._up)
    Mousetrap.unbind(['down'], this._down)
    Mousetrap.unbind(['enter'], this._enter)
  }

  setQuery (query) {
    this.setState({
      listProps: {
        query,
        focusedIndex: 0,
      },
    })

    this.matchedIndices = []
  }

  addMatched (index) {
    if (this.matchedIndices.indexOf(index) !== -1) {
      return
    }

    this.matchedIndices = [...this.matchedIndices, index]

    if (this.matchedIndices.indexOf(this.state.listProps.focusedIndex) === -1) {
      this.setIndex(index)
    }
  }

  render () {
    const { data, renderItem, t, navigation, ...props } = this.props

    return (
      <FilteredListContext.Provider value={{ ...this.state }}>
        <View
          style={{
            borderRadius: 10,
            margin: 10,
            marginBottom: 0,
          }}
        >
          <Text
            onChangeText={query => this.setQuery(query)}
            input={{
              placeholder: t('contacts.quick-switch-placeholder'),
              autoFocus: true,
            }}
            big
            background={colors.white}
            color={colors.fakeBlack}
            left
            margin
            padding={{ top: 10 }}
          />
        </View>
        <FlatList
          listProps={this.state.listProps}
          data={data}
          renderItem={({ ...props }) =>
            renderItem({
              ...props,
              listProps: this.state.listProps,
              addMatched: index => this.addMatched(index),
              setCandidateRoute: route => this.setCandidateRoute(route),
            })
          }
          getItemLayout={(data, index) => {
            return {
              length: 72,
              index,
              offset: 72 * index,
            }
          }}
          ref={list => (this._list = list)}
          {...props}
        />
      </FilteredListContext.Provider>
    )
  }
}

const SwitcherListComponent = withGoBack(
  withNavigation(
    withNavigationFocus(withNamespaces()(SwitcherListComponentBase))
  )
)

const ItemBase = fragments.Conversation(
  withNavigation(
    class ItemClass extends React.PureComponent {
      constructor (props) {
        super(props)

        const item = this.props.data

        this.forceIgnore = false

        if (!item.members) {
          this.forceIgnore = true
        } else if (
          item.members.length === 2 &&
          item.members.some(
            m =>
              m.contact == null ||
              (m.contact.displayName === '' &&
                m.contact.overrideDisplayName === '')
          )
        ) {
          this.forceIgnore = true
        } else {
          this.title = utils.getTitle(item)
          const membersName = item.members
            .filter(m => m.contact && m.contact.status !== 42)
            .map(
              m => `${m.contact.displayName} ${m.contact.overrideDisplayName}`
            )
            .join(' ')

          this.testedName = (membersName + this.title).toLocaleLowerCase()
        }
      }

      testItem () {
        const { query } = this.props

        return this.testedName.indexOf(query.toLocaleLowerCase()) !== -1
      }

      render () {
        if (this.forceIgnore || !this.testItem()) {
          return null
        }

        const {
          data,
          navigation,
          index,
          addMatched,
          focusedIndex,
          setCandidateRoute,
        } = this.props

        const route = {
          routeName: 'chats/subviews',
          action: StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'chats/detail',
                params: data,
              }),
            ],
          }),
        }

        if (index === focusedIndex) {
          setCandidateRoute(route)
        }

        addMatched && addMatched(index)

        const title = utils.getTitle(data)

        return (
          <Flex.Cols
            align='center'
            onPress={() => navigation.navigate(route)}
            style={[
              { height: 72 },
              padding,
              borderTop,
              index === focusedIndex ? { backgroundColor: colors.blue } : null,
            ]}
          >
            <Flex.Rows size={1} align='center'>
              <Avatar data={data} size={40} />
            </Flex.Rows>
            <Flex.Rows
              size={7}
              align='stretch'
              justify='center'
              style={[marginLeft]}
            >
              <Text
                color={index === focusedIndex ? colors.white : colors.fakeBlack}
                left
                middle
              >
                {title}
              </Text>
            </Flex.Rows>
          </Flex.Cols>
        )
      }
    }
  )
)

class Item extends React.PureComponent {
  render () {
    return (
      <FilteredListContext.Consumer>
        {({ listProps: { focusedIndex, query } }) => {
          return (
            <ItemBase
              {...this.props}
              focusedIndex={focusedIndex}
              query={query}
            />
          )
        }}
      </FilteredListContext.Consumer>
    )
  }
}

class ContactCardModal extends React.Component {
  render () {
    const {
      context,
      context: { queries, fragments },
    } = this.props

    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingTop: 50,
        }}
      >
        <ModalScreen
          keyboardDismiss
          backgroundColor={colors.transparentGrey}
          width={modalWidth}
        >
          <View
            style={{
              height: 358,
            }}
          >
            <Pagination
              direction='forward'
              query={queries.ConversationList.graphql}
              variables={queries.ConversationList.defaultVariables}
              fragment={fragments.ConversationList}
              alias='ConversationList'
              ListComponent={SwitcherListComponent}
              renderItem={props => <Item {...props} context={context} />}
              emptyItem={() => <Text>Nothing found</Text>}
            />
          </View>
        </ModalScreen>
      </View>
    )
  }
}

export default withRelayContext(ContactCardModal)
