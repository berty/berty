import React from 'react'
import Icon from '@berty/view/component/Icon'
import Flex from '@berty/view/component/Flex'
import { colors } from '@berty/common/constants'

const Placeholder = () => (
  <Flex.Rows
    style={{ justifyContent: 'center', backgroundColor: colors.bgGrey }}
  >
    <Icon
      name={'berty-berty_picto'}
      size={128}
      color={colors.lightGrey}
      style={{ textAlign: 'center' }}
    />
  </Flex.Rows>
)

Placeholder.navigationOptions = () => ({
  header: null,
})

export default Placeholder
