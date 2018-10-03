package node

import (
	"context"
	"encoding/json"
	"fmt"
	"testing"

	"berty.tech/core/api/node"
	"berty.tech/core/entity"
	. "github.com/smartystreets/goconvey/convey"
)

func TestPagination(t *testing.T) {
	Convey("testing pagination", t, func() {
		// prepare
		ctx := context.Background()
		alice, _ := testNode(t)
		So(alice.sql.Where("1=1").Delete(&entity.Contact{}).Error, ShouldBeNil)
		for i := 0; i < 5; i++ {
			So(alice.sql.Save(&entity.Contact{ID: fmt.Sprintf("abcde_%d", i)}).Error, ShouldBeNil)
		}
		So(alice.sql.Model(entity.Contact{}).Where("1=1").UpdateColumn("created_at", nil).UpdateColumn("updated_at", nil).Error, ShouldBeNil)
		//alice.sql = alice.sql.Debug() // FIXME: remove

		// test1: first=2, after=nil
		out, err := alice.ContactListPaginated(ctx, &node.ContactListInput{
			Paginate: &node.Pagination{
				First: 2,
			},
		})
		So(err, ShouldBeNil)
		expected := node.ContactListOutput{
			Edges: []*node.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_0"}, Cursor: "abcde_0"},
				{Node: &entity.Contact{ID: "abcde_1"}, Cursor: "abcde_1"},
			},
			PageInfo: &node.PageInfo{
				StartCursor: "abcde_0",
				EndCursor:   "abcde_1",
				HasNextPage: true,
				Count:       5,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		// test2: first=2, after=abcde_2
		out, err = alice.ContactListPaginated(ctx, &node.ContactListInput{
			Paginate: &node.Pagination{
				First: 2,
				After: "abcde_1",
			},
		})
		So(err, ShouldBeNil)
		expected = node.ContactListOutput{
			Edges: []*node.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_2"}, Cursor: "abcde_2"},
				{Node: &entity.Contact{ID: "abcde_3"}, Cursor: "abcde_3"},
			},
			PageInfo: &node.PageInfo{
				StartCursor:     "abcde_2",
				EndCursor:       "abcde_3",
				HasPreviousPage: true,
				HasNextPage:     true,
				Count:           5,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))

		// test3: first=2, after=abcde_3
		out, err = alice.ContactListPaginated(ctx, &node.ContactListInput{
			Paginate: &node.Pagination{
				First: 2,
				After: "abcde_3",
			},
		})
		So(err, ShouldBeNil)
		expected = node.ContactListOutput{
			Edges: []*node.ContactEdge{
				{Node: &entity.Contact{ID: "abcde_4"}, Cursor: "abcde_4"},
			},
			PageInfo: &node.PageInfo{
				StartCursor:     "abcde_4",
				EndCursor:       "abcde_4",
				HasPreviousPage: true,
				HasNextPage:     false,
				Count:           5,
			},
		}
		So(toIndentedJSON(out), ShouldEqual, toIndentedJSON(expected))
		//fmt.Println(toIndentedJSON(out))
		//fmt.Println(toIndentedJSON(expected))
	})
}

func toJSON(input interface{}) string {
	out, _ := json.Marshal(input)
	return string(out)
}

func toIndentedJSON(input interface{}) string {
	out, _ := json.MarshalIndent(input, "", "  ")
	return string(out)
}
