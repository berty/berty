import React, { createContext, useContext, useState } from 'react'
import { Declaration, Styles } from './types'
import { mapScaledDeclaration, defaultStylesDeclaration } from './map-declaration'

const defaultStyles = mapScaledDeclaration(defaultStylesDeclaration)

export type SetStylesDeclaration = (
	decl: Declaration,
	setStyles: React.Dispatch<React.SetStateAction<Styles>>,
) => void

export const setStylesDeclaration: SetStylesDeclaration = (decl, setStyles) =>
	setStyles(mapScaledDeclaration(decl))

export type Context = React.Context<[Styles, (decl: Declaration) => void]>

export const ctx: Context = createContext([
	defaultStyles,
	(decl: Declaration) => setStylesDeclaration(decl, () => {}),
])

export const Provider: React.FC = ({ children }) => {
	const [stylesState, setStylesState] = useState(defaultStyles)
	return (
		<ctx.Provider value={[stylesState, (decl) => setStylesDeclaration(decl, setStylesState)]}>
			{children}
		</ctx.Provider>
	)
}
export const Consumer = ctx.Consumer

export const useStyles = () => {
	return useContext(ctx)
}
