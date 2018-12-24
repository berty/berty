package errorcodes

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes/duration"
	"go.uber.org/zap"
	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type causer interface {
	Cause() error
}

var (
	withStacktrace = true // FIXME: make configurable
	defaultCode    = ErrUndefined
)

//type Error status.Status

type Error struct {
	message    string
	status     *status.Status
	stackTrace string
	metadata   Metadata
	cause      error
	// FIXME: isGRPC
	// FIXME: stackTrace length (for Error())
}

func (e *Error) localizedMessages() map[string]string {
	out := map[string]string{}
	for _, detail := range e.status.Details() {
		switch d := detail.(type) {
		case *errdetails.LocalizedMessage:
			out[d.Locale] = d.Message
		}
	}
	return out
}

func (e *Error) Error() string {
	out := e.message
	localized := e.localizedMessages()
	if system, ok := localized["system"]; ok {
		out += fmt.Sprintf(" (%s)", system)
	}
	if e.status.Code() != codes.Unknown {
		out += fmt.Sprintf(" (gRPC=%q)", e.status.Code())
	}
	if e.cause != nil {
		out += fmt.Sprintf(": %s", e.cause.Error())
	}
	if placeholders := e.Placeholders(); placeholders != nil && len(placeholders) > 0 {
		jsonOut, _ := json.Marshal(placeholders)
		out += " " + string(jsonOut)
	}

	// FIXME: print translated error if available
	// FIXME: print gRPC code if unusual
	// FIXME: print errorcodes.Code if different from message

	return out
}

func (e *Error) Code() Code {
	if m := e.Metadata(); m != nil {
		return m.Code
	}
	return defaultCode
}

func (e *Error) Placeholders() map[string]string {
	if m := e.Metadata(); m != nil {
		return m.Placeholders
	}
	return nil
}

func (e *Error) Metadata() *Metadata {
	if !e.metadata.IsEmpty() {
		return &e.metadata
	}
	for _, detail := range e.status.Details() {
		switch d := detail.(type) {
		case *Metadata:
			if !d.IsEmpty() {
				return d
			}
		}
	}
	return nil
}

func (e *Error) ExtendedCodes() []Code {
	if m := e.Metadata(); m != nil {
		return m.ExtendedCodes
	}
	return nil
}

func (e *Error) Message() string {
	return e.message
}

func (e *Error) Status() *status.Status {
	return e.status
}

func (e *Error) Cause() error {
	return e.cause
}

func FromStatus(st *status.Status) *Error {
	return &Error{
		status:  st,
		message: st.Message(),
	}
}

func deepestStackTrace(err error) string {
	stackTraces := []string{}
	stackTrace := ""

	for err != nil {
		if grpcStatuser, ok := err.(withGRPCStatus); ok {
			if st := grpcStatuser.GRPCStatus(); st != nil {
				for _, detail := range st.Details() {
					if debugInfo, ok := detail.(*errdetails.DebugInfo); ok {
						// on GRPCStatus, we concat parent and children errors to have both client/server stacktraces
						if stackTrace != "" {
							stackTraces = append(stackTraces, stackTrace)
						}
						stackTrace = fmt.Sprintf("gRPC:\n%s", strings.Join(debugInfo.StackEntries, "\n"))
					}
				}
			}
		}
		if ec, ok := err.(*Error); ok && ec.stackTrace != "" {
			stackTrace = ec.stackTrace
		}
		if st, ok := err.(stackTracer); ok {
			stackTrace = fmt.Sprintf("%+v", st.StackTrace())
		}

		cause, ok := err.(causer)
		if !ok {
			break
		}
		err = cause.Cause()
	}
	if stackTrace != "" {
		stackTraces = append(stackTraces, stackTrace)
	}
	return strings.Join(stackTraces, "\n\n")
}

func FromError(err error) (*Error, bool) {
	return fromError(err, codes.Unknown, true)
}

func (e *Error) setCause(cause error) *Error {
	e.cause = cause
	return e
}

func (e *Error) setStacktrace(stackTrace string) {
	if stackTrace != "" {
		e.stackTrace = stackTrace
		e.metadata.Caller = strings.Split(stackTrace, "\n")[0]
	}
}

func fromError(err error, code codes.Code, topLevel bool) (*Error, bool) {
	stackTrace := ""
	if topLevel && withStacktrace {
		stackTrace = deepestStackTrace(err)
	}

	var (
		parent         *Error
		parentMetadata *Metadata
	)
	if causer, ok := err.(causer); ok {
		if cause := causer.Cause(); cause != nil && cause != err {
			parent, _ = fromError(cause, codes.Unknown, false)
			parentMetadata = parent.Metadata()
		}
	}

	if err == nil {
		e := FromStatus(status.New(code, ""))
		e.metadata.Code = OK
		e.metadata.Parent = parentMetadata
		e.setStacktrace(stackTrace)
		return e, true
	}

	if e, ok := err.(*Error); ok {
		e.setStacktrace(stackTrace)
		return e, true
	}

	if grpcStatuser, ok := err.(withGRPCStatus); ok {
		st := grpcStatuser.GRPCStatus()
		fromThisModule := false
		if st != nil {
			e := FromStatus(st)
			for _, detail := range st.Details() {
				switch d := detail.(type) {
				case *errdetails.DebugInfo:
					// FIXME: handle multiple DebugInfo
					e.setStacktrace(strings.Join(d.StackEntries, "\n"))
				case *Error, Error:
					logger().Error("should not happen")
				case *Metadata:
					fromThisModule = true
				case *errdetails.RetryInfo, *errdetails.LocalizedMessage: // nothing to do here, these details will be inherited
					continue
				default:
					logger().Debug("unhandled detail type", zap.String("detail", fmt.Sprintf("%v", d)))
				}
			}
			return e, fromThisModule
		}
	}

	if parent != nil { // generated from err.Cause()
		e := FromStatus(status.New(code, ""))
		e.message = err.Error()
		e.setStacktrace(stackTrace)
		e.metadata.Parent = parentMetadata
		details := []proto.Message{}
		for _, detail := range parent.status.Details() {
			switch d := detail.(type) {
			case *errdetails.DebugInfo:
				continue
			default:
				details = append(details, d.(proto.Message))
			}
		}
		if e.status, err = e.status.WithDetails(details...); err != nil {
			logger().Warn("failed to inherit parent details", zap.Error(err))
		}
		return e, false
	}

	// other error types
	e := FromStatus(status.Convert(err))
	e.message = err.Error()
	e.metadata.Code = defaultCode
	e.metadata.Parent = parentMetadata
	e.setStacktrace(stackTrace)
	return e, false
}

type withGRPCStatus interface {
	GRPCStatus() *status.Status
}

func WithDetails(err error, details ...proto.Message) *Error {
	return convert(err, codes.Unknown, nil).WithDetails(details...)
}

func (e *Error) WithDetails(details ...proto.Message) *Error {
	details = append(details, &errdetails.RetryInfo{RetryDelay: &duration.Duration{Seconds: 60}}) // FIXME: remove
	newStatus, err := e.status.WithDetails(details...)
	if err != nil {
		logger().Warn("failed to set status details", zap.Error(err))
	}
	e.status = newStatus
	return e
}

func (e *Error) GRPCStatus() *status.Status {
	code := e.Code().grpcCode()
	if e.Code() == defaultCode {
		code = e.status.Code()
	}
	st := status.New(code, e.Message())

	var details []proto.Message

	for _, detail := range e.status.Details() { // clone source details
		details = append(details, detail.(proto.Message))
	}

	if m := e.Metadata(); m != nil {
		details = append(details, m)
	}

	// FIXME: investigate if we can and should enable the following extra details
	// retry policy
	//   details = append(details, &errdetails.RetryInfo{RetryDelay: &duration.Duration{Seconds: 60}})
	// span / context
	//   details = append(details, &errdetails.RequestInfo{RequestId: "FIXME: get span id"})
	// i18n
	//   details = append(details, &errdetails.LocalizedMessage{Locale: "en-us", Message: "english reason"})
	// bad request / field violation
	//   details = append(details, &errdetails.BadRequest{FieldViolations: ...})

	if withStacktrace {
		// FIXME: check also "Cause" for the original stacktrace

		if e.stackTrace != "" {
			details = append(details, &errdetails.DebugInfo{
				// Detail: ...
				StackEntries: strings.Split(e.stackTrace, "\n"),
			})
		}

	}

	detailedStatus, err := st.WithDetails(details...)
	if err != nil {
		logger().Warn("failed to append details to grpc status", zap.Error(err))
		return st
	}
	return detailedStatus
}

func (e *Error) setStack(stack *stack) *Error {
	if withStacktrace && e.stackTrace == "" && stack != nil {
		e.stackTrace = fmt.Sprintf("%+v", stack.StackTrace())
	}

	return e
}

// Convert is a convenience function which removes the need to handle the
// boolean return value from FromError.
func Convert(err error) *Error {
	return convert(err, codes.Unknown, nil)
}

func convert(err error, code codes.Code, stack *stack) *Error {
	e, _ := fromError(err, code, true)
	return e.setStack(stack)
}

// Extensions is used for GraphQL errors enrichment
func (e *Error) Extensions() map[string]interface{} {
	extensions := make(map[string]interface{})
	if m := e.Metadata(); m != nil {
		extensions = m.Extensions()
	}
	localizedMessages := e.localizedMessages()
	// FIXME: check if there is a localization for current language
	if message, ok := localizedMessages["user"]; ok {
		extensions["message"] = message
	} else {
		extensions["message"] = e.message
	}
	return extensions
}

func (e *Error) Format(s fmt.State, verb rune) {
	// FIXME: enable color
	//yellow := color.New(color.FgWhite, color.BgYellow).SprintFunc()
	//red := color.New(color.FgWhite, color.BgRed).SprintFunc()

	switch verb {
	case 'v':
		if s.Flag('+') {
			fmt.Fprintf(s, "Error: %s\n", e.message)
			st := status.Convert(e)
			for _, detail := range st.Details() {
				switch d := detail.(type) {
				case *errdetails.DebugInfo:
					// FIXME: use a stack pretty printer
					for _, line := range d.StackEntries {
						fmt.Fprintln(s, line)
					}
				case *Error:
					fmt.Fprintf(s, "debug: *errorcodes.Error: %v\n", d)
				case *Metadata:
					// FIXME: display more info
					fmt.Fprintf(s, "debug: *errorcodes.Metadata: %+v\n", d)
				case *Code:
					fmt.Fprintf(s, "debug: *errorcodes.Code: %v\n", d)
				case *errdetails.RetryInfo:
					fmt.Fprintf(s, "debug: *errdetails.RetryInfo: %v\n", d)
				case *errdetails.LocalizedMessage:
					fmt.Fprintf(s, "debug: *errdetails.LocalizedMessage: %v\n", d)
				case *errdetails.BadRequest:
					fmt.Fprintf(s, "debug: *errdetails.BadRequest: %v\n", d)
				default:
					fmt.Fprintf(s, "debug: unknown detail type: %v\n", d)
				}
			}
			return
		}
		fallthrough
	case 's':
		fmt.Fprintf(s, "%s", e.Error())
	case 'q':
		fmt.Fprintf(s, "%q", e.Error())
	}

	return
}
