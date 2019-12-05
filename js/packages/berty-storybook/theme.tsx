import React from 'react'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import { IconRegistry, ApplicationProvider } from 'react-native-ui-kitten'
import { mapping, light } from '@eva-design/eva'
import i18n from '@berty-tech/berty-i18n'
import { I18nextProvider } from 'react-i18next'

export const Provider: React.FC = ({ children }) => (
	<>
		<I18nextProvider i18n={i18n}>
			<IconRegistry icons={EvaIconsPack} />
			<ApplicationProvider mapping={mapping} theme={light}>
				{children}
			</ApplicationProvider>
		</I18nextProvider>
	</>
)
