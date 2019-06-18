package node

import (
	"fmt"
	"time"

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
	var cursor interface{}
	switch paginate.OrderBy {
	case "", "id":
		paginate.OrderBy = "id"
		if paginate.First > 0 {
			cursor = paginate.After
		} else {
			cursor = paginate.Before
		}
		break
	case "created_at", "updated_at", "wrote_at":
		var err error
		if paginate.First > 0 {
			cursor, err = time.Parse(time.RFC3339Nano, paginate.After)
		} else {
			cursor, err = time.Parse(time.RFC3339Nano, paginate.Before)
		}
		if err != nil {
			return nil, err
		}
		cursor = cursor.(time.Time).UTC()
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
		if !paginate.OrderDesc {
			query = query.Where(fmt.Sprintf("%s > ?", paginate.OrderBy), cursor)
		} else {
			query = query.Where(fmt.Sprintf("%s < ?", paginate.OrderBy), cursor)
		}
	}

	if paginate.Last > 0 && paginate.Before != "" {
		query = query.Where(fmt.Sprintf("%s > ?", paginate.OrderBy), cursor)
	}
	return query, nil
}
