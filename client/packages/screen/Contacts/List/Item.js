import React, { PureComponent } from 'react'
import * as enums from '@berty/common/enums.gen'
import { Avatar, Flex, Text } from '@berty/component'
import { borderBottom, marginLeft, padding } from '@berty/common/styles'
import { colors } from '@berty/common/constants'
import { withNavigation } from 'react-navigation'
import ActionsUnknown from '@berty/component/ContactIdentityActions/ActionsUnknown'
import ActionsReceived from '@berty/component/ContactIdentityActions/ActionsReceived'
import ActionsSent from '@berty/component/ContactIdentityActions/ActionsSent'
import { withNamespaces } from 'react-i18next'
import { withStoreContext } from '@berty/store/context'

@withStoreContext
@withNamespaces()
@withNavigation
export class Item extends PureComponent {
  showDetails = () => {
    const { data, navigation } = this.props
    if (
      [
        enums.BertyEntityContactInputStatus.IsRequested,
        enums.BertyEntityContactInputStatus.RequestedMe,
      ].indexOf(data.status) !== -1
    ) {
      return navigation.navigate('modal/contacts/card', data)
    }
    return navigation.navigate('contact/detail/list', data)
  }

  render() {
    const { context, data, ignoreMyself, t } = this.props
    const { overrideDisplayName, displayName, status } = data

    if (ignoreMyself && status === enums.BertyEntityContactInputStatus.Myself) {
      return null
    }

    return (
      <Flex.Cols
        align="center"
        style={[{ height: 72 }, padding, borderBottom]}
        onPress={this.showDetails}
      >
        <Flex.Cols size={1} align="center">
          <Avatar.Contact data={data} size={40} />
          <Flex.Rows size={3} justify="start" style={[marginLeft]}>
            <Text color={colors.fakeBlack} left ellipsed>
              {overrideDisplayName || displayName}
            </Text>
            <Text color={colors.subtleGrey} left ellipsed tiny>
              {t(
                `contacts.statuses.${
                  enums.ValueBertyEntityContactInputStatus[status]
                }`
              )}
            </Text>
          </Flex.Rows>
        </Flex.Cols>
        {status === enums.BertyEntityContactInputStatus.Unknown && (
          <ActionsUnknown data={data} context={context} />
        )}
        {status === enums.BertyEntityContactInputStatus.RequestedMe && (
          <ActionsReceived data={data} context={context} />
        )}
        {status === enums.BertyEntityContactInputStatus.IsRequested && (
          <ActionsSent data={data} context={context} />
        )}
      </Flex.Cols>
    )
  }
}

export default Item
