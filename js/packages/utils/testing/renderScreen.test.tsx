import { NavigationContainer } from '@react-navigation/native'
import { render } from '@testing-library/react-native'
import React, { ComponentProps } from 'react'
import { Provider } from 'react-redux'

import { isReadyRef, navigationRef } from '@berty/navigation/rootRef'
import { ScreenFC, ScreensParams } from '@berty/navigation/types'
import store from '@berty/redux/store'

const testNavigationProps = <N extends keyof ScreensParams>(
	name: N,
	params?: Readonly<ScreensParams[N]>,
) => {
	const navigation: ComponentProps<ScreenFC<N>>['navigation'] = {
		navigate: jest.fn(),
		dispatch: jest.fn(),
		reset: jest.fn(),
		goBack: jest.fn(),
		isFocused: jest.fn(),
		canGoBack: jest.fn(),
		getState: jest.fn(),
		getParent: jest.fn(),
		setParams: jest.fn(),
		setOptions: jest.fn(),
		addListener: jest.fn(),
		removeListener: jest.fn(),
		replace: jest.fn(),
		push: jest.fn(),
		pop: jest.fn(),
		popToTop: jest.fn(),
	}

	// don't know why we have to cast be it shouldn't be harmful
	const route: ComponentProps<ScreenFC<N>>['route'] =
		params === undefined
			? ({ key: name, name } as ComponentProps<ScreenFC<N>>['route'])
			: {
					key: name,
					name: name as Extract<N, string>,
					params,
			  }

	return { navigation, route }
}

const TestProvider: React.FC = ({ children }) => {
	return (
		<Provider store={store}>
			<NavigationContainer
				ref={navigationRef}
				onReady={() => {
					isReadyRef.current = true
				}}
			>
				{children}
			</NavigationContainer>
		</Provider>
	)
}

export const renderScreen = <N extends keyof ScreensParams>(
	name: N,
	Screen: ScreenFC<N>,
	params?: Readonly<ScreensParams[N]>,
) => {
	return render(
		<TestProvider>
			<Screen {...testNavigationProps(name, params)} />
		</TestProvider>,
	)
}
