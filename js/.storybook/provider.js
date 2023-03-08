import React from 'react'
import { Router } from 'react-router'
import { Provider } from 'react-redux'

const ProviderWrapper = ({ children, store }) => (
	<Provider store={store}>
		<Router>{children}</Router>
	</Provider>
)

export default ProviderWrapper
