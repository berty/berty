import { ApplicationProvider } from 'react-native-ui-kitten'
import { linkTo } from '@storybook/addon-links'
import { mapping, light } from '@eva-design/eva'
import React from 'react'
import { storiesOf, addParameters } from '@storybook/react-native'
import { promiseResolved, fakeRequests, fakeConversations } from './faker'
import * as Onboarding from './Onboarding'
import * as Main from './Main'

// import { withI18n } from "storybook-addon-i18n";
// import "storybook-addon-i18n/register.js";
// import { languages } from "@berty-tech/berty-i18n/locale/languages"

// addParameters({
//   i18n: {
//     provider: null, // provider,
//     providerProps: {
//       // props
//     },
//     supportedLocales: ["en", "fr"],
//     providerLocaleKey: "locale"
//   }
// });

const stories = storiesOf('Berty', module)

// stories.addDecorator(withI18n);

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
      createAccount={promiseResolved}
      generateKey={promiseResolved}
      authorizeNotifications={promiseResolved}
      authorizeBluetooth={promiseResolved}
      startApp={linkTo('Onboarding.Privacy')}
    />
  ))
  .add('Onboarding.Privacy', () => (
    <Onboarding.Privacy
      createAccount={promiseResolved}
      generateKey={promiseResolved}
      startApp={linkTo('Onboarding.Privacy')}
    />
  ))
  .add('Main.List', () => (
    <Main.List
      requests={fakeRequests}
      conversations={fakeConversations}
      footer={{
        search: (): void => {},
        plus: (): void => {},
        account: (): void => {},
      }}
    />
  ))
