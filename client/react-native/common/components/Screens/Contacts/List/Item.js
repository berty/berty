import React, { PureComponent } from 'react'
import { fragments, enums } from '../../../../graphql'
import { Avatar, Flex, Text } from '../../../Library'
import { borderBottom, marginLeft, padding } from '../../../../styles'
import { colors } from '../../../../constants'
import Case from 'case'
import { showContactModal } from '../../../../helpers/contacts'
import NavigationService from '../../../../helpers/NavigationService'
import ActionsReceived from '../../../Library/ContactIdentityActions/ActionsReceived'
import ActionsSent from '../../../Library/ContactIdentityActions/ActionsSent'

const Item = fragments.Contact(
  class Item extends PureComponent {
    async showDetails () {
      const {
        data: { id, displayName, status, overrideDisplayName },
        context,
      } = this.props

      if ([
        enums.BertyEntityContactInputStatus.IsRequested,
        enums.BertyEntityContactInputStatus.RequestedMe,
      ].indexOf(status) !== -1) {
        await showContactModal({
          relayContext: context,
          data: {
            id,
            displayName,
          },
        })

        return
      }

      NavigationService.navigate('contacts/detail', {
        contact: {
          id,
          overrideDisplayName,
          displayName,
        },
      })
    }

    render () {
      const { data, ignoreMyself } = this.props
      const { overrideDisplayName, displayName, status } = data

      if (ignoreMyself && status === enums.BertyEntityContactInputStatus.Myself) {
        return null
      }

      return <Flex.Cols
        align='center'
        style={[{ height: 72 }, padding, borderBottom]}
        onPress={() => this.showDetails()}
      >
        <Flex.Rows size={1} align='center'>
          <Avatar data={data} size={40} />
        </Flex.Rows>
        <Flex.Rows size={3} align='stretch' justify='left' style={[marginLeft]} >
          <Text color={colors.black} left margin={{ left: 16 }}>
            {overrideDisplayName || displayName}
          </Text>
          <Text color={colors.subtleGrey} left margin={{ left: 16 }}>
            {Case.lower(enums.ValueBertyEntityContactInputStatus[status]).replace(
              /^is /g,
              '',
            )}
          </Text>
        </Flex.Rows>
        <Flex.Rows size={4} align='center'>
          {status === enums.BertyEntityContactInputStatus.RequestedMe && <ActionsReceived data={data} />}
          {status === enums.BertyEntityContactInputStatus.IsRequested && <ActionsSent data={data} />}
        </Flex.Rows>
      </Flex.Cols>
    }
  })

export default Item
