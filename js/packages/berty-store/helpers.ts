type TRequest = {}
type TResponse = {}
type TCallbackMethod = (
	request: TRequest,
	callback: (error?: Error, response?: TResponse) => void,
) => void
type TListHandler = (method: TCallbackMethod, request: TRequest) => Promise<Array<TResponse>>
type TGetHandler = (method: TCallbackMethod, request: TRequest) => Promise<TResponse>
type TStreamHandler = (method: TCallbackMethod, request: TRequest) => Promise<TResponse>

export const streamHandler: TStreamHandler = (method, request) =>
	new Promise((resolve, reject): void =>
		method(request, (error, response) => {
			if (error) {
				reject(error)
			} else if (response) {
				resolve(response)
			}
		}),
	)

export const listHandler: TListHandler = (method, request) => {
	return new Promise((resolve, reject): void => {
		const data: Array<{}> = []
		method(request, (error, response) => {
			if (error) {
				reject(error)
			} else if (response) {
				data.push(response)
				resolve(data)
			}
		})
	})
}

export const getHandler: TGetHandler = (method, request) =>
	new Promise((resolve, reject): void =>
		method(request, (error, response) => {
			if (error) {
				reject(error)
			} else if (response) {
				resolve(response)
			}
		}),
	)
