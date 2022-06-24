import React from 'react'

export type AddBotCallback = React.Dispatch<
	React.SetStateAction<{
		link: string
		displayName: string
		isVisible: boolean
	}>
>
