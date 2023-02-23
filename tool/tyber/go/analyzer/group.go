package analyzer

import (
	"errors"

	"berty.tech/berty/v2/tool/tyber/go/parser"
	"berty.tech/weshnet/pkg/tyber"
)

type Group struct {
	GroupPK string   `json:"groupPK"`
	Members []string `json:"members"`
}

func (g *Group) parseTrace(trace *parser.AppTrace) error {
	for _, step := range trace.Steps {
		if step.Name == "dispatched member update" {
			if err := g.parseMemberDeviceAdded(step.Details); err != nil {
				return err
			}
			return nil
		}
	}
	return errors.New("missing steps in logs")
}

func (g *Group) parseMemberDeviceAdded(details []tyber.Detail) error {
	found := 0
	for _, detail := range details {
		if detail.Name == "GroupPK" {
			g.GroupPK = detail.Description
			found++
		} else if detail.Name == "MemberPK" {
			if !contains(g.Members, detail.Description) {
				g.Members = append(g.Members, detail.Description)
			}
			found++
		}

		if found == 2 {
			return nil
		}
	}

	return errors.New("failed parsing GroupJoined")
}

func contains(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}
