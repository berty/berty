package node

import (
	"context"
	"fmt"
	"reflect"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"github.com/jinzhu/gorm"
	opentracing "github.com/opentracing/opentracing-go"
)

// WithSQL registers a gorm connection as the node database
func WithSQL(sql *gorm.DB) NewNodeOption {
	return func(n *Node) {
		n.sqlDriver = sql.Unscoped()
	}
}

// sql returns a gorm.DB object with opentracing context
func (n *Node) sql(ctx context.Context) *gorm.DB {
	if ctx == nil {
		return n.sqlDriver.Set("rootSpan", n.rootSpan)
	}
	if span := opentracing.SpanFromContext(ctx); span != nil {
		return n.sqlDriver.Set("rootSpan", span)
	}
	return n.sqlDriver
}

func (n *Node) handleCommitLogs() {
	clbk := n.sqlDriver.Callback()

	clbk.Create().Register("berty:after_create", func(scope *gorm.Scope) { n.handleCommitLog("create", scope) })
	clbk.Update().Register("berty:after_update", func(scope *gorm.Scope) { n.handleCommitLog("update", scope) })
	clbk.Delete().Register("berty:after_delete", func(scope *gorm.Scope) { n.handleCommitLog("delete", scope) })

	logger().Debug("commit logs handled")
}

func (n *Node) unhandleCommitLogs() {
	clbk := n.sqlDriver.Callback()

	clbk.Create().Remove("berty:after_create")
	clbk.Update().Remove("berty:after_update")
	clbk.Delete().Remove("berty:after_delete")

	logger().Debug("commit logs unhandled")
}

func (n *Node) handleCommitLog(operation string, scope *gorm.Scope) {
	// same usage as https://github.com/jinzhu/gorm/blob/master/scope.go#L241

	if scope.HasError() {
		return
	}

	if scope.Value == nil {
		return
	}

	if indirectScopeValue := scope.IndirectValue(); indirectScopeValue.Kind() == reflect.Slice {
		for i := 0; i < indirectScopeValue.Len(); i++ {
			log := n.createCommitLog(operation, indirectScopeValue.Index(i))
			if log != nil {
				n.clientCommitLogs <- log
			}
		}
	} else {
		log := n.createCommitLog(operation, indirectScopeValue)
		if log != nil {
			n.clientCommitLogs <- log
		}
	}
}

func (n *Node) createCommitLog(operation string, reflectValue reflect.Value) *node.CommitLog {

	log := &node.CommitLog{}

	switch operation {
	case "create":
		log.Operation = node.CommitLog_Create
	case "update":
		log.Operation = node.CommitLog_Update
	case "delete":
		log.Operation = node.CommitLog_Delete
	default:
		logger().Warn(fmt.Sprintf("undefined operation %+v", operation))
		return nil
	}

	// Only get address from non-pointer
	if reflectValue.CanAddr() && reflectValue.Kind() != reflect.Ptr {
		reflectValue = reflectValue.Addr()
	}

	switch e := reflectValue.Interface().(type) {
	case *entity.Config:
		log.Entity = &node.CommitLog_Entity{Config: e}
	case *entity.Contact:
		log.Entity = &node.CommitLog_Entity{Contact: e}
	case *entity.Device:
		log.Entity = &node.CommitLog_Entity{Device: e}
	case *entity.Conversation:
		log.Entity = &node.CommitLog_Entity{Conversation: e}
	case *entity.ConversationMember:
		log.Entity = &node.CommitLog_Entity{ConversationMember: e}
	case *p2p.Event:
		log.Entity = &node.CommitLog_Entity{Event: e}
	default:
		logger().Warn(fmt.Sprintf("unhandled entity %+v", e))
		return nil
	}
	return log
}
