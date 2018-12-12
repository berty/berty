package node

import (
	"fmt"

	"berty.tech/core/api/node"
	"berty.tech/core/pkg/errorcodes"
	"github.com/jinzhu/gorm"
)

func paginate(query *gorm.DB, paginate *node.Pagination) (*gorm.DB, error) {
	if paginate == nil {
		return query, nil
	}
	if paginate.Last > 0 {
		return nil, errorcodes.ErrUnimplemented.New()
	}
	if paginate.Before != "" {
		return nil, errorcodes.ErrUnimplemented.New()
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
		return nil, errorcodes.ErrUnimplemented.New()
	}

	// apply defaults to paginate
	if paginate.First > 0 {
		query = query.Limit(paginate.First)
	}

	if paginate.Last > 0 {
		query = query.Limit(paginate.Last)
		paginate.OrderBy = paginate.OrderBy + " DESC"
	}

	// build the query
	orderBy := paginate.OrderBy
	if paginate.OrderDesc {
		orderBy += " DESC"
	}
	query = query.Order(orderBy, true)

	if paginate.First > 0 && paginate.After != "" {
		if !paginate.OrderDesc && paginate.First > 0 {
			query = query.Where(fmt.Sprintf("%s > ?", paginate.OrderBy), paginate.After)
		} else {
			query = query.Where(fmt.Sprintf("%s < ?", paginate.OrderBy), paginate.After)
		}
	}

	if paginate.Last > 0 && paginate.Before != "" {
		query = query.Where(fmt.Sprintf("%s > ?", paginate.OrderBy), paginate.Before)
	}
	return query, nil
}
