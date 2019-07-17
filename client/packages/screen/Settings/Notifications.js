import { Header, Menu, Loader } from '@berty/component'
import {
  enableNativeNotifications,
  disableNativeNotifications,
  getNativePushType,
  enableMQTTNotifications,
  disableMQTTNotifications,
} from '@berty/common/helpers/notifications'
import { withStoreContext } from '@berty/store/context'
import { Store } from '@berty/container'
import React, { PureComponent } from 'react'
import * as enums from '@berty/common/enums.gen'
import { Switch, Platform, NativeModules, Alert } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

const { CoreModule } = NativeModules

const dummyPubKey =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1wyoWXdQZeaQoOKvC2YRwR3+GTb8prpMFNdOmhikU8eionUBKgKnUyIbr/DTvCJQhTlHZfy1pUL6mmRIk9PDQDO1t4ATY9LXfo/O3KoKJ0GmxhGdjheOf1kiKcrem+MJjBVEriZ7tJvuhA/DztQ1zolvflPz9+aNL1qA6qzJD/m2fNYpfEehtZH37MoN/qcn3THnC8H/wwr6soU5GpdPBiXXKcg1IFiaZX9JAoUzKVyzY1xQ/DOzCYCboPSXh1qSsMFsg2LCAmC56s9czKk7foAOV/WZ3Zzbv6yd74K6TdV0xwMgCctZjNa7/Tbq4pCBK2vEMutSXAJlfo+6K9dLQQIDAQAB'
const dummyPushId = 'dummy-push-id'

// according to https://developer.apple.com/documentation/usernotifications/unauthorizationstatus
export const notificationStatus = {
  notDetermined: 0,
  denied: 1,
  authorized: 2,
  provisional: 3,
}

@withNamespaces()
@withStoreContext
export class Notifications extends PureComponent {
  getCurrentPushConfigs = () =>
    this.props.data.filter(elt => elt.pushType === getNativePushType())

  getCurrentMQTTConfigs = () =>
    this.props.data.filter(
      elt =>
        elt.pushType === enums.BertyPushDevicePushTypeInputDevicePushType.MQTT
    )

  getCurrentConfig = () => this.props.config

  state = {
    pushConfigsSwitch: this.getCurrentPushConfigs().length > 0,
    mqttConfigsSwitch: this.getCurrentMQTTConfigs().length > 0,
    notificationsEnabled: this.getCurrentConfig().notificationsEnabled,
    notificationsPreviews: this.getCurrentConfig().notificationsPreviews,
  }

  async updateConfig() {
    try {
      const config = {
        ...this.props.config,
        notificationsEnabled: this.state.notificationsEnabled,
        notificationsPreviews: this.state.notificationsPreviews,
      }

      await this.props.context.node.service.configUpdate(config)
    } catch (e) {
      showMessage({
        message: String(e),
        type: 'danger',
        icon: 'danger',
        position: 'top',
      })

      this.setState({
        notificationsEnabled: this.getCurrentConfig().notificationsEnabled,
        notificationsPreviews: this.getCurrentConfig().notificationsPreviews,
      })
    }
  }

  render() {
    const { t, context } = this.props
    const nativePushType = getNativePushType()
    const currentMQTTConfigs = this.getCurrentMQTTConfigs()
    const { pushConfigsSwitch, mqttConfigsSwitch } = this.state

    return (
      <Menu>
        <Menu.Section title={t('settings.notifications-transport')}>
          {Platform.OS !== 'web' &&
            nativePushType ===
              enums.BertyPushDevicePushTypeInputDevicePushType
                .UnknownDevicePushType && (
              <Menu.Item title={t('settings.push-transport-not-supported')} />
            )}
          {nativePushType !==
            enums.BertyPushDevicePushTypeInputDevicePushType
              .UnknownDevicePushType && (
            <Menu.Item
              title={
                (nativePushType ===
                enums.BertyPushDevicePushTypeInputDevicePushType.APNS
                  ? t('settings.push-berty-apple-servers')
                  : '') +
                (nativePushType ===
                enums.BertyPushDevicePushTypeInputDevicePushType.FCM
                  ? t('settings.push-berty-google-firebase-servers')
                  : '')
              }
              left
              customRight={
                <Switch
                  justify="end"
                  disabled={false}
                  value={pushConfigsSwitch}
                  onValueChange={async value =>
                    this.setState(
                      {
                        pushConfigsSwitch: value,
                      },
                      async () => {
                        try {
                          value
                            ? await enableNativeNotifications({ context })
                            : await disableNativeNotifications({ context })
                          this.props.refresh()
                        } catch (err) {
                          this.setState({
                            pushConfigsSwitch:
                              this.getCurrentPushConfigs().length > 0,
                          })
                        }
                      }
                    )
                  }
                />
              }
            />
          )}
          {Platform.OS === 'web' && (
            <Menu.Item
              title={t('settings.push-mqtt-berty-servers')}
              customRight={
                <Switch
                  justify="end"
                  disabled={false}
                  value={mqttConfigsSwitch}
                  onValueChange={value =>
                    this.setState(
                      {
                        mqttConfigsSwitch: value,
                      },
                      async () => {
                        try {
                          value
                            ? await enableMQTTNotifications({
                                context,
                                relayPubkey: dummyPubKey,
                                pushId: dummyPushId,
                              })
                            : await disableMQTTNotifications({
                                context,
                                currentPushConfigs: currentMQTTConfigs,
                              })
                          this.props.refresh()
                        } catch (err) {
                          this.setState({
                            mqttConfigsSwitch:
                              this.getCurrentPushConfigs().length > 0,
                          })
                        }
                      }
                    )
                  }
                />
              }
            />
          )}
        </Menu.Section>
        <Menu.Section title={t('settings.notifications-alerts')}>
          <Menu.Item
            title={t('chats.notifications-enabled')}
            left
            customRight={
              <Switch
                justify="end"
                onValueChange={async notificationsEnabled => {
                  if (Platform.OS === 'ios' && notificationsEnabled === true) {
                    if (
                      (await CoreModule.getNotificationStatus()) ===
                      notificationStatus.denied
                    ) {
                      Alert.alert(
                        t('onboarding.notifications.enable'),
                        t('settings.notifications-open-settings'),
                        [
                          { text: t('cancel') },
                          {
                            text: 'OK',
                            onPress: () => CoreModule.openSettings(),
                          },
                        ]
                      )
                      return
                    } else {
                      await enableNativeNotifications({ context })
                    }
                  }
                  this.setState({ notificationsEnabled }, () =>
                    this.updateConfig()
                  )
                }}
                value={this.state.notificationsEnabled}
              />
            }
          />
          <Menu.Item
            title={t('chats.notifications-preview')}
            left
            customRight={
              <Switch
                justify="end"
                onValueChange={async notificationsPreviews => {
                  this.setState({ notificationsPreviews }, () =>
                    this.updateConfig()
                  )
                }}
                value={this.state.notificationsPreviews}
              />
            }
          />
          <Menu.Item
            title={t('chats.notifications-sound')}
            textRight="Paulette"
            left
          />
        </Menu.Section>
      </Menu>
    )
  }
}

@withStoreContext
class NotificationWrapper extends React.PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('chats.notifications')}
        backBtn
      />
    ),
  })

  render() {
    return (
      <Store.Entity.Config>
        {config =>
          config ? (
            <Store.Node.Service.DevicePushConfigList
              response={(queue, data) => {
                queue.push(data)
                return queue
              }}
              fallback={<Loader />}
            >
              {({ queue, retry }) => (
                <Notifications data={queue} refresh={retry} config={config} />
              )}
            </Store.Node.Service.DevicePushConfigList>
          ) : (
            <Loader />
          )
        }
      </Store.Entity.Config>
    )
  }
}

export default NotificationWrapper
