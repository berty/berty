import { TextInput, Platform } from 'react-native'
import React from 'react'

import Flex from './Flex'
import { colors } from '../../constants'
import { paddingLeft, paddingRight } from '../../styles'
import { withNamespaces } from 'react-i18next'

const SearchBar = props => (
  <Flex.Cols size={1}>
    <TextInput
      underlineColorAndroid='transparent'
      autoCorrect={
        (props.autoCorrect !== undefined && props.autoCorrect) || false
      }
      style={[
        ...(props.style || []),
        {
          height: 36,
          flex: 1,
          backgroundColor: colors.inputGrey,
          borderWidth: 0,
          borderRadius: 18,
          ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
        },
        paddingLeft,
        paddingRight,
      ]}
      placeholder={
        props.placeholder !== undefined ? props.placeholder : props.t('search-placeholder')
      }
      onChangeText={props.onChangeText}
    />
    {props.children}
  </Flex.Cols>
)

export default withNamespaces()(SearchBar)
