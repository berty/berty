import React from 'react'
import Icon from '../Library/Icon'
import Flex from '../Library/Flex'
import { colors } from '../../constants'

const Placeholder = () => <Flex.Rows style={{ justifyContent: 'center', backgroundColor: colors.bgGrey }} >
  <Icon name={'berty-berty_picto'} size={128} color={colors.lightGrey} style={{ textAlign: 'center' }} />
</Flex.Rows>

Placeholder.navigationOptions = () => ({
  header: null,
})

export default Placeholder
