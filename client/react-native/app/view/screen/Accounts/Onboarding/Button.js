import React from 'react'
import { Button } from '@berty/component'
import colors from '@berty/common/constants/colors'

export const SkipButton = props => (
  <Button
    {...props}
    left
    color={colors.darkGrey}
    margin
    padding
    small
    rounded
  />
)

export const NextButton = props => (
  <Button
    {...props}
    color={colors.inputGrey}
    background={colors.blue}
    small
    margin
    padding
    center
    rounded
  />
)
