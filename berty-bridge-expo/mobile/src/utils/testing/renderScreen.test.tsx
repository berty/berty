import { ExpoRoot } from 'expo-router'
import { render } from '@testing-library/react-native'
import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'

import { CustomIconsPack } from '@berty/assets/custom-icons'
import { FeatherIconsPack } from '@berty/assets/feather-icons'
import { UIKittenProvider } from '@berty/contexts/uiKitten.context'
import { encodeParams } from '@berty/navigation/params'
import { ROUTE_PATHS } from '@berty/navigation/routes'
import { ScreenFC, ScreensParams } from '@berty/navigation/types'
import store from '@berty/redux/store'

import { makeRouteContext, routeContextKey } from './routerContext'

const TestProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<SafeAreaProvider
			initialMetrics={{
				frame: { x: 0, y: 0, width: 0, height: 0 },
				insets: { top: 0, left: 0, right: 0, bottom: 0 },
			}}
		>
			<Provider store={store}>
				<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
				<UIKittenProvider>{children}</UIKittenProvider>
			</Provider>
		</SafeAreaProvider>
	)
}

export const renderScreen = <N extends keyof ScreensParams>(
	name: N,
	Screen: ScreenFC<N>,
	params?: Readonly<ScreensParams[N]>,
) => {
	const path = ROUTE_PATHS[name]
	const search = new URLSearchParams(
		encodeParams(name, params as ScreensParams[N] | undefined) ?? {},
	).toString()

	return render(
		<TestProvider>
			<ExpoRoot
				context={makeRouteContext({ [routeContextKey(path)]: Screen })}
				location={search ? `${path}?${search}` : path}
			/>
		</TestProvider>,
	)
}
