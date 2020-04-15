import React from 'react'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { IconRegistry, ApplicationProvider } from 'react-native-ui-kitten'
import { mapping, light } from '@eva-design/eva'

export const Provider: React.FC = ({ children }) => (
	<>
		<IconRegistry icons={EvaIconsPack} />
		<ApplicationProvider
			mapping={mapping}
			customMapping={{
				strict: {
					'text-font-family': 'Open Sans',
					'text-paragraph-1-font-weight': '600',
				},
			}}
			theme={light}
		>
			{children}
		</ApplicationProvider>
	</>
)
