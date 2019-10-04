import { ApplicationProvider } from 'react-native-ui-kitten'
import { linkTo } from '@storybook/addon-links'
import { mapping, light } from '@eva-design/eva'
import React from 'react'
import { storiesOf } from '@storybook/react-native'

import * as Onboarding from './Onboarding'

const stories = storiesOf('Berty', module)

stories.addDecorator((storyFn) => (
  <ApplicationProvider mapping={mapping} theme={light}>
    {storyFn()}
  </ApplicationProvider>
))

stories
  .add('Onboarding.GetStarted', () => (
    <Onboarding.GetStarted selectMode={linkTo('Onboarding.SelectMode')} />
  ))
  .add('Onboarding.SelectMode', () => (
    <Onboarding.SelectMode
      performance={linkTo('Onboarding.Performance')}
      privacy={linkTo('Onboarding.Privacy')}
    />
  ))
  .add('Onboarding.Performance', () => (
    <Onboarding.Performance
      createAccount={(): Promise<void> => Promise.resolve()}
      generateKey={(): Promise<void> =>
        new Promise((resolve): void => {
          setTimeout(resolve, 1000)
        })
      }
      authorizeNotifications={(): Promise<void> => Promise.resolve()}
      authorizeBluetooth={(): Promise<void> => Promise.resolve()}
      startApp={linkTo('Onboarding.Privacy')}
    />
  ))
  .add('Onboarding.Privacy', () => (
    <Onboarding.Privacy
      createAccount={(): Promise<void> => Promise.resolve()}
      generateKey={(): Promise<void> =>
        new Promise((resolve): void => {
          setTimeout(resolve, 1000)
        })
      }
      startApp={linkTo('Onboarding.Privacy')}
    />
  ))
