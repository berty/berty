import { Stack } from "expo-router";

import { initI18N } from '@berty/i18n'

initI18N()

export default function RootLayout() {
  return <Stack
		screenOptions={
			{
				headerShown: false,
			}
		}
	/>;
}
