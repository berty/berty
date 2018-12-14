import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import { fragments, enums } from '../../../../graphql'
import { Avatar, Flex, Text } from '../../../Library'
import { borderBottom, padding } from '../../../../styles'
import { colors } from '../../../../constants'
import Case from 'case'
import { showContactModal } from '../../../../helpers/contacts'
import NavigationService from '../../../../helpers/NavigationService'
import ActionsReceived from '../../../Library/ContactIdentityActions/ActionsReceived'
import ActionsSent from '../../../Library/ContactIdentityActions/ActionsSent'

const Item = fragments.Contact(
  class Item extends PureComponent {
    onAccept = async () => {
      await this.props.context.mutations.contactAcceptRequest({
        id: this.props.data.id,
      })
    }

    onDecline = async () => {
      await this.props.context.mutations.contactRemove({ id: this.props.data.id })
    }

    onRemove = async () => {
      await this.props.context.mutations.contactRemove({ id: this.props.data.id })
    }

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
      const { data } = this.props
      const { overrideDisplayName, displayName, status } = data

      return <Flex.Cols
        align='center'
        style={[{ height: 72 }, padding, borderBottom]}
      >
        <TouchableOpacity onPress={() => this.showDetails()}>
          <Avatar data={this.props.data} size={40} />
        </TouchableOpacity>

        <Flex.Rows>
          <TouchableOpacity onPress={() => this.showDetails()}>
            <Text color={colors.black} left middle margin={{ left: 16 }}>
              {overrideDisplayName || displayName}
            </Text>
            <Text color={colors.subtleGrey} left middle margin={{ left: 16 }}>
              {Case.lower(enums.ValueBertyEntityContactInputStatus[status]).replace(
                /^is /g,
                '',
              )}
            </Text>
          </TouchableOpacity>
        </Flex.Rows>

        <Flex.Cols size={4} justify='start'>
        </Flex.Cols>

        {status === enums.BertyEntityContactInputStatus.RequestedMe && <ActionsReceived data={data} />}
        {status === enums.BertyEntityContactInputStatus.IsRequested && <ActionsSent data={data} />}
      </Flex.Cols>
    }
  })

export default Item
