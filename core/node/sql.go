package node

import "github.com/jinzhu/gorm"

// WithSQL registers a gorm connection as the node database
func WithSQL(sql *gorm.DB) NewNodeOption {
	return func(n *Node) {
		n.sql = sql
	}
}
