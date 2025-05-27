export type UnaryMock<Request, Reply> = (req: Request) => Promise<Reply>

export type ResponseStreamMock<Request, Reply> = (
	request: Request,
	send: (reply: Reply) => Promise<void>,
) => Promise<void>

export type RequestStreamMock<Request, Reply> = (
	onRequest: (listener: (request: Request) => void) => void,
	onEnd: (listener: () => void) => void,
) => Promise<Reply>
