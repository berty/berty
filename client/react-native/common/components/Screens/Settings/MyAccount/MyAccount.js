import React, { PureComponent } from 'react'
import { ActivityIndicator } from 'react-native'
import { Screen, Menu, Header, Text, Badge, Flex, Avatar } from '../../../Library'
import { colors } from '../../../../constants'
import { QueryReducer } from '../../../../relay'
import { choosePicture } from '../../../../helpers/react-native-image-picker'
import { graphql } from 'react-relay'
import I18n from 'i18next'
import { withNamespaces } from 'react-i18next'

class MyAccount extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const onSave = navigation.getParam('onSave')
    return {
      tabBarVisible: false,
      header: (
        <Header
          navigation={navigation}
          title={I18n.t('my-account.title')}
          rightBtnIcon={'save'}
          onPressRightBtn={onSave}
          backBtn
        />
      ),
    }
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onSave: this.onSave,
    })
  }

  state = {
    uri: null,
  }

  onChoosePicture = async event => this.setState(await choosePicture(event))

  onSave = () => {
    this.setState({ edit: false }, () =>
      this.props.navigation.setParams({ state: this.state })
    )
  }

  static Menu = ({ navigation, data, state, onChoosePicture, t }) => {
    const { displayName, overrideDisplayName } = data
    return (
      <Menu absolute>
        <Menu.Header
          icon={
            <Badge
              background={colors.blue}
              icon='camera'
              medium
              onPress={onChoosePicture}
            >
              <Avatar data={data} size={78} />
            </Badge>
          }
        />
        <Menu.Section title={t('contacts.first-name')}>
          <Menu.Input
            value={(overrideDisplayName || displayName).split(' ')[0] || ''}
          />
        </Menu.Section>
        <Menu.Section title={t('contacts.last-name')}>
          <Menu.Input
            value={(overrideDisplayName || displayName).split(' ')[1] || ''}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='trash-2'
            title={t('my-account.delete-my-account')}
            color={colors.error}
            onPress={() => console.error('delete my account: not implemented')}
          />
        </Menu.Section>
      </Menu>
    )
  }

  render () {
    const { t } = this.props

    return (
      <Screen>
        <QueryReducer
          query={graphql`
            query MyAccountSettingsQuery($filter: BertyEntityContactInput) {
              ContactList(
                filter: $filter
                first: 1
                orderBy: ""
                orderDesc: false
              ) {
                edges {
                  node {
                    id
                    displayName
                    overrideDisplayName
                  }
                }
              }
            }
          `}
          variables={{
            filter: {
              id: '',
              status: 42,
              displayName: '',
              displayStatus: '',
              overrideDisplayName: '',
              overrideDisplayStatus: '',
            },
          }}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return (
                  <Flex.Rows justify='center' align='center'>
                    <ActivityIndicator size='large' />
                  </Flex.Rows>
                )
              case state.success:
                return (
                  <MyAccount.Menu
                    navigation={this.props.navigation}
                    data={state.data.ContactList.edges[0].node}
                    state={this.state}
                    onChoosePicture={this.onChoosePicture}
                    t={t}
                  />
                )
              case state.error:
                return (
                  <Text
                    background={colors.error}
                    color={colors.white}
                    medium
                    middle
                    center
                    self='center'
                  >
                    {t('fatal-unexpected-error')}
                  </Text>
                )
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default withNamespaces()(MyAccount)
