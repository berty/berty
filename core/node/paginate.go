package node

import (
	"fmt"

	"berty.tech/core/api/node"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
)

func paginate(query *gorm.DB, paginate *node.Pagination) (*gorm.DB, error) {
	if paginate == nil {
		return query, nil
	}
	if paginate.Last > 0 {
		return nil, errors.Wrap(ErrNotImplemented, "input.Paginate.Last not supported")
	}
	if paginate.Before != "" {
		return nil, errors.Wrap(ErrNotImplemented, "input.Paginate.Before not supported")
	}
	switch paginate.OrderBy {
	case "":
		paginate.OrderBy = "id"
		break
	case "id":
	case "created_at":
	case "updated_at":
		break
	default:
		return nil, errors.Wrap(ErrNotImplemented, "'OrderBy' is only supported for 'id', 'created_at', 'updated_at'")
	}

	// apply defaults to paginate
	if paginate.First > 0 {
		query = query.Limit(paginate.First)
	}

	// build the query
	orderBy := paginate.OrderBy
	if paginate.OrderDesc {
		orderBy += " DESC"
	}
	query = query.Order(orderBy, true)

	if paginate.After != "" {
		if paginate.OrderDesc {
			query = query.Where(fmt.Sprintf("%s < ?", paginate.OrderBy), paginate.After)
		} else {
			query = query.Where(fmt.Sprintf("%s > ?", paginate.OrderBy), paginate.After)
		}
	}

	return query, nil
}
