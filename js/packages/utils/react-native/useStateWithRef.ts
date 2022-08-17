import React from 'react'

export function useStateWithRef<T>(
	defaultValue: T,
): [T, (val: T) => void, React.MutableRefObject<T>] {
	const [_state, _setState] = React.useState<T>(defaultValue)
	const _ref = React.useRef<T>(defaultValue)

	const setState = React.useCallback((value: T) => {
		_setState(value)
		_ref.current = value
	}, [])

	return [_state, setState, _ref]
}
