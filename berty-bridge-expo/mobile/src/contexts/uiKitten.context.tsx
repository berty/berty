import { mapping, light } from '@eva-design/eva'
import { ApplicationProvider } from '@ui-kitten/components'
import React from 'react'
import { StatusBar } from 'react-native'

export const UIKittenProvider: React.FC = ({ children }) => (
	<>
		<ApplicationProvider
			mapping={mapping}
			customMapping={
				{
					strict: {
						'text-font-family': 'Open Sans',
						'text-paragraph-1-font-weight': '600',
					},
				} as any
			}
			theme={light}
		>
			<StatusBar barStyle='dark-content' />
			{children}
		</ApplicationProvider>
	</>
)
