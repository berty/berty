import React, { useContext } from 'react'
import { Request } from '../shared-components/Request'
import { BertyChatChatService as Store } from '@berty-tech/berty-store'
import { ScreenProps } from '@berty-tech/berty-navigation'

//
// ContactRequest => Accept/Refuse
//

export const ContactRequest: React.FC<ScreenProps.Main.ContactRequest> = ({
	route: { params },
}) => {
	const store = useContext(Store.Context)
	return <Request user={params} accept={(_) => {}} decline={(_) => {}} />
}
