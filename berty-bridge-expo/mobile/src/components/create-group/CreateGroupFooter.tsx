import React from 'react'

import { SecondaryButton } from '@berty/components'

import { CreateGroupFooterPriv } from './CreateGroupFooter.priv'

interface CreateGroupFooterProps {
	title: string
	action: () => void
	loading: boolean
}

export const CreateGroupFooter = ({ title, action, loading }: CreateGroupFooterProps) => {
	return (
		<CreateGroupFooterPriv>
			<SecondaryButton loading={loading} onPress={action}>
				{title}
			</SecondaryButton>
		</CreateGroupFooterPriv>
	)
}
