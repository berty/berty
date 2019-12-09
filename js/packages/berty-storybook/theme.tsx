import React from 'react'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { IconRegistry, ApplicationProvider } from 'react-native-ui-kitten'
import { mapping, light } from '@eva-design/eva'

export const Provider: React.FC = ({ children }) => (
	<>
		<IconRegistry icons={EvaIconsPack} />
		<ApplicationProvider mapping={mapping} theme={light}>
			{children}
		</ApplicationProvider>
	</>
)
