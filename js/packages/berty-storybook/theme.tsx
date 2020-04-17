import React from 'react'
import { ApplicationProvider } from 'react-native-ui-kitten'
import { mapping, light } from '@eva-design/eva'

export const Provider: React.FC = ({ children }) => (
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
			{children}
		</ApplicationProvider>
	</>
)
