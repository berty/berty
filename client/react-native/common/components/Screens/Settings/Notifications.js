import React, { PureComponent } from 'react'
import { ActivityIndicator, Switch } from 'react-native'
import { Flex, Header, Menu } from '../../Library'
import I18n from 'i18next'
import { withNamespaces } from 'react-i18next'
import { QueryReducer, RelayContext } from '../../../relay'
import { merge } from '../../../helpers'
import { enableNativeNotifications, disableNativeNotifications, getNativePushType } from '../../../helpers/notifications'
import { enums } from '../../../graphql'

class NotificationsBase extends PureComponent {
  render () {
    const { t, data, context } = this.props
    const nativePushType = getNativePushType()
    const currentPushConfigs = data.filter(elt => elt.pushType === nativePushType)

    return (
      <Menu>
        <Menu.Section title={t('settings.notifications-transport')}>
          {nativePushType === enums.BertyEntityDevicePushTypeInputDevicePushType.UnknownDevicePushType
            ? <Menu.Item title={t('settings.push-transport-not-supported')} />
            : <Menu.Item
              title={
                (nativePushType === enums.BertyEntityDevicePushTypeInputDevicePushType.APNS ? t('settings.push-berty-apple-servers') : '') +
                (nativePushType === enums.BertyEntityDevicePushTypeInputDevicePushType.FCM ? t('settings.push-berty-google-firebase-servers') : '')
              }
              left
              customRight={
                <Switch
                  justify='end'
                  disabled={false}
                  value={currentPushConfigs.length > 0}
                  onValueChange={async value => {
                    value
                      ? enableNativeNotifications({ context })
                      : disableNativeNotifications({ context, pushConfigs: data })
                    await this.props.refresh()
                  }}
                />
              }
            /> }
        </Menu.Section>
        <Menu.Section title={t('settings.notifications-alerts')}>
          <Menu.Item
            title={t('chats.notifications-enabled')}
            left
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value
              />
            }
          />
          <Menu.Item
            title={t('chats.notifications-preview')}
            left
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value
              />
            }
          />
          <Menu.Item title={t('chats.notifications-sound')}
            textRight='Paulette' left />
        </Menu.Section>
      </Menu>
    )
  }
}

export default class NotificationWrapper extends React.PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation}
      title={I18n.t('chats.notifications')} backBtn />,
  })

  render () {
    const props = this.props

    return <RelayContext.Consumer>
      {(context) => <QueryReducer
        query={context.queries.DevicePushConfigList.graphql}
        variables={merge([
          context.queries.DevicePushConfigList.defaultVariables,
        ])}
      >
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
              return (
                <Notifications
                  data={state.data.DevicePushConfigList.edges}
                  context={context}
                  refresh={retry}
                  {...props}
                />
              )
            case state.error:
              setTimeout(() => retry(), 1000)
              return null
          }
        }}
      </QueryReducer>}
    </RelayContext.Consumer>
  }
}

const Notifications = withNamespaces()(NotificationsBase)
