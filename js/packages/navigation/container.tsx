import React from 'react'
import { NavigationContainer as ReactNavigationContainer } from '@react-navigation/native'

export const NavigationContainer: React.FC = ({ children }) => (
	<ReactNavigationContainer>{children}</ReactNavigationContainer>
)
