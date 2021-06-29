import React from 'react'
import { ApplicationProvider } from '@ui-kitten/components'
import { mapping, light } from '@eva-design/eva'

import { StatusBarWrapper } from './shared-components'

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
			<StatusBarWrapper />
			{children}
		</ApplicationProvider>
	</>
)
