import React, { PureComponent } from 'react'
import { enums, fragments } from '../../../../graphql'
import { Avatar, Flex, Text } from '../../../Library'
import { borderBottom, marginLeft, padding } from '../../../../styles'
import { colors } from '../../../../constants'
import { showContact } from '../../../../helpers/contacts'
import { withNavigation } from 'react-navigation'
import ActionsUnknown from '../../../Library/ContactIdentityActions/ActionsUnknown'
import ActionsReceived from '../../../Library/ContactIdentityActions/ActionsReceived'
import ActionsSent from '../../../Library/ContactIdentityActions/ActionsSent'
import { withNamespaces } from 'react-i18next'

const Item = fragments.Contact(
  class Item extends PureComponent {
    async showDetails () {
      const { data, context, navigation } = this.props

      return showContact({ data, context, navigation })
    }

    render () {
      const { data, ignoreMyself, t } = this.props
      const { overrideDisplayName, displayName, status } = data

      if (
        ignoreMyself &&
        status === enums.BertyEntityContactInputStatus.Myself
      ) {
        return null
      }

      return (
        <Flex.Cols
          align='center'
          style={[{ height: 72 }, padding, borderBottom]}
          onPress={() => this.showDetails()}
        >
          <Flex.Cols size={1} align='center'>
            <Avatar data={data} size={40} />
            <Flex.Rows size={3} justify='start' style={[marginLeft]}>
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
            <ActionsUnknown data={data} />
          )}
          {status === enums.BertyEntityContactInputStatus.RequestedMe && (
            <ActionsReceived data={data} />
          )}
          {status === enums.BertyEntityContactInputStatus.IsRequested && (
            <ActionsSent data={data} />
          )}
        </Flex.Cols>
      )
    }
  }
)

export default withNavigation(withNamespaces()(Item))
