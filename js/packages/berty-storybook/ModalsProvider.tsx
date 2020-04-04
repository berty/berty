import React, { useState, useContext } from 'react'

export type ModalsContextValue = {
	current?: JSX.Element
	setCurrent: (current?: ModalsContextValue['current']) => void
}

export const ModalsContext: React.Context<ModalsContextValue> = React.createContext({
	setCurrent: () => console.error('Used ModalsContext outside of a ModalsProvider'),
})

const Renderer: React.FC = () => {
	console.log('render')
	const modals = useContext(ModalsContext)
	return modals.current || null
}

export const ModalsProvider: React.FC = ({ children }) => {
	const [current, setCurrent] = useState<ModalsContextValue['current']>()
	return (
		<ModalsContext.Provider value={{ current, setCurrent }}>
			<Renderer />
			{children}
		</ModalsContext.Provider>
	)
}
