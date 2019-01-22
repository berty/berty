import React, { PureComponent } from 'react'
import { ActivityIndicator, Switch, Platform } from 'react-native'
import { Flex, Header, Menu } from '../../Library'
import I18n from 'i18next'
import { withNamespaces } from 'react-i18next'
import { QueryReducer, RelayContext } from '../../../relay'
import { merge } from '../../../helpers'
import { enableNativeNotifications, disableNativeNotifications, getNativePushType, enableMQTTNotifications, disableMQTTNotifications } from '../../../helpers/notifications'
import { enums } from '../../../graphql'

const dummyPubKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1wyoWXdQZeaQoOKvC2YRwR3+GTb8prpMFNdOmhikU8eionUBKgKnUyIbr/DTvCJQhTlHZfy1pUL6mmRIk9PDQDO1t4ATY9LXfo/O3KoKJ0GmxhGdjheOf1kiKcrem+MJjBVEriZ7tJvuhA/DztQ1zolvflPz9+aNL1qA6qzJD/m2fNYpfEehtZH37MoN/qcn3THnC8H/wwr6soU5GpdPBiXXKcg1IFiaZX9JAoUzKVyzY1xQ/DOzCYCboPSXh1qSsMFsg2LCAmC56s9czKk7foAOV/WZ3Zzbv6yd74K6TdV0xwMgCctZjNa7/Tbq4pCBK2vEMutSXAJlfo+6K9dLQQIDAQAB'
const dummyPushId = 'dummy-push-id'

class NotificationsBase extends PureComponent {
  render () {
    const { t, data, context } = this.props
    const nativePushType = getNativePushType()
    const currentPushConfigs = data.filter(elt => elt.pushType === nativePushType)
    const currentMQTTConfigs = data.filter(elt => elt.pushType === enums.BertyPushDevicePushTypeInputDevicePushType.MQTT)

    return (
      <Menu>
        <Menu.Section title={t('settings.notifications-transport')}>
          {Platform.OS !== 'web' && nativePushType === enums.BertyPushDevicePushTypeInputDevicePushType.UnknownDevicePushType && <Menu.Item title={t('settings.push-transport-not-supported')} />}
          {nativePushType !== enums.BertyPushDevicePushTypeInputDevicePushType.UnknownDevicePushType && <Menu.Item
            title={
              (nativePushType === enums.BertyPushDevicePushTypeInputDevicePushType.APNS ? t('settings.push-berty-apple-servers') : '') +
              (nativePushType === enums.BertyPushDevicePushTypeInputDevicePushType.FCM ? t('settings.push-berty-google-firebase-servers') : '')
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
                    : disableNativeNotifications({ context })
                  await this.props.refresh()
                }}
              />
            }
          /> }
          {Platform.OS === 'web' && <Menu.Item
            title={t('settings.push-mqtt-berty-servers')}
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={currentMQTTConfigs.length > 0}
                onValueChange={async value => {
                  value
                    ? enableMQTTNotifications({ context, relayPubkey: dummyPubKey, pushId: dummyPushId })
                    : disableMQTTNotifications({ context, currentPushConfigs: currentMQTTConfigs })
                  await this.props.refresh()
                }}
              />
            } />}
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
