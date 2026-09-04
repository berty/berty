// Entry route. The stack previously started on 'Account.SelectNode'
// (initialRouteName in stacks.tsx), so redirect there on launch.
import { Redirect } from 'expo-router'

import { ROUTE_PATHS } from '@berty/navigation/routes'

export default function Index() {
	return <Redirect href={ROUTE_PATHS['Account.SelectNode'] as never} />
}
