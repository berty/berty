import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { Onboarding } from './Onboarding'
import { ApplicationProvider } from 'react-native-ui-kitten'
import { mapping, light } from '@eva-design/eva'

storiesOf('Berty', module)
  .addDecorator((storyFn) => (
    <ApplicationProvider mapping={mapping} theme={light}>
      {storyFn()}
    </ApplicationProvider>
  ))
  .add('Onboarding.GetStarted', () => <Onboarding.GetStarted />)
  .add('Onboarding.SelectMode', () => <Onboarding.SelectMode />)
  .add('Onboarding.Performance', () => <Onboarding.Performance />)
  .add('Onboarding.Privacy', () => <Onboarding.Privacy />)
