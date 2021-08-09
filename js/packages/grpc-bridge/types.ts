import { GRPCError } from './error'

export type RequestStream<Request extends {}, Reply extends {}> = ({}) => Promise<{
	emit: (r: Request) => Promise<void>
	stopAndRecv: () => Promise<Reply>
	stop: () => Promise<void>
}>

export type ResponseStream<Request extends {}, Reply extends {}> = (req: Request) => Promise<{
	start: () => Promise<void>
	onMessage: (cb: (rep: Reply | null, err: GRPCError | null) => void) => void
	stop: () => Promise<void>
}>

export type Unary<IRequest extends {}, IReply extends {}> = (req: IRequest) => Promise<IReply>

export type Await<T> = T extends PromiseLike<infer U> ? U : T

export type GRPCMethod = (req: any, cb: () => {}) => Promise<any>

export type RequestStreamType<
	Method extends GRPCMethod,
	Request = Parameters<Method>[0],
	Reply = Await<ReturnType<Method>>,
> = RequestStream<Request, Reply>

export type ResponseStreamType<
	Method extends GRPCMethod,
	Request = Parameters<Method>[0],
	Reply = Await<ReturnType<Method>>,
> = ResponseStream<Request, Reply>

export type UnaryType<
	Method extends GRPCMethod,
	Request = Parameters<Method>[0],
	Reply = Await<ReturnType<Method>>,
> = Unary<Request, Reply>
