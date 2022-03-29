import beapi from '@berty/api'
import { reduce } from 'lodash'

class GRPCError extends Error {
	public EOF: boolean
	public OK: boolean
	public Code: beapi.errcode.ErrCode
	public GrpcCode: beapi.bridge.GRPCErrCode

	public error: beapi.bridge.Error

	constructor(e: beapi.bridge.IError | null | undefined) {
		if (!e) {
			// this should not happen, but should not break the app either.
			// instead simply create a empty error and warn about this
			console.warn(`GRPCError: (${e}) grpc error provided, empty error returned`)
			e = beapi.bridge.Error.create({})
		}

		const error = beapi.bridge.Error.create(e)
		super(error.message)

		this.error = error
		this.Code = error.errorCode
		this.GrpcCode = error.grpcErrorCode

		this.OK =
			error.grpcErrorCode === beapi.bridge.GRPCErrCode.OK &&
			error.errorCode === beapi.errcode.ErrCode.Undefined
		this.EOF =
			error.grpcErrorCode === beapi.bridge.GRPCErrCode.CANCELED ||
			(error.grpcErrorCode === beapi.bridge.GRPCErrCode.UNKNOWN && error.message === 'EOF')
	}

	public details(): beapi.errcode.ErrDetails {
		if (this.error.errorDetails) {
			return beapi.errcode.ErrDetails.create(this.error.errorDetails)
		}

		return beapi.errcode.ErrDetails.create({})
	}

	public errCode(): beapi.errcode.ErrCode {
		return this.Code
	}

	public grpcErrorCode(): beapi.bridge.GRPCErrCode {
		return this.GrpcCode
	}

	public toJSON(): any {
		const details = this.details().codes.map((err: beapi.errcode.ErrCode) => {
			return beapi.errcode.ErrCode[err]
		})

		return {
			message: this.message,
			grpcErrorCode: beapi.bridge.GRPCErrCode[this.GrpcCode],
			errorCode: beapi.errcode.ErrCode[this.Code],
			details: details,
			EOF: this.EOF,
			OK: this.OK,
		}
	}

	public hasErrCode(error: beapi.errcode.ErrCode): boolean {
		return reduce(this.error.errorDetails?.codes, (ac, v) => ac && v == error, false) || false
	}
}

const newGRPCError = (code: number, message: string): GRPCError => {
	const error = beapi.bridge.Error.fromObject({
		message: message,
		grpcErrorCode: code,
	})
	return new GRPCError(error)
}

const EOF = new GRPCError({
	grpcErrorCode: beapi.bridge.GRPCErrCode.CANCELED,
	message: 'EOF',
})

export { GRPCError, EOF, newGRPCError }
