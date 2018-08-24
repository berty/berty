package graphql

import (
	"context"
	"fmt"

	"github.com/vektah/gqlparser/ast"
)

type ExecutableSchema interface {
	Schema() *ast.Schema

	Query(ctx context.Context, op *ast.OperationDefinition) *Response
	Mutation(ctx context.Context, op *ast.OperationDefinition) *Response
	Subscription(ctx context.Context, op *ast.OperationDefinition) func() *Response
}

func CollectFields(ctx context.Context, selSet ast.SelectionSet, satisfies []string) []CollectedField {
	return collectFields(GetRequestContext(ctx), selSet, satisfies, map[string]bool{})
}

func collectFields(reqCtx *RequestContext, selSet ast.SelectionSet, satisfies []string, visited map[string]bool) []CollectedField {
	var groupedFields []CollectedField

	for _, sel := range selSet {
		switch sel := sel.(type) {
		case *ast.Field:
			if !shouldIncludeNode(sel.Directives, reqCtx.Variables) {
				continue
			}
			f := getOrCreateField(&groupedFields, sel.Alias, func() CollectedField {
				return CollectedField{Field: sel}
			})

			f.Selections = append(f.Selections, sel.SelectionSet...)
		case *ast.InlineFragment:
			if !shouldIncludeNode(sel.Directives, reqCtx.Variables) || !instanceOf(sel.TypeCondition, satisfies) {
				continue
			}
			for _, childField := range collectFields(reqCtx, sel.SelectionSet, satisfies, visited) {
				f := getOrCreateField(&groupedFields, childField.Name, func() CollectedField { return childField })
				f.Selections = append(f.Selections, childField.Selections...)
			}

		case *ast.FragmentSpread:
			if !shouldIncludeNode(sel.Directives, reqCtx.Variables) {
				continue
			}
			fragmentName := sel.Name
			if _, seen := visited[fragmentName]; seen {
				continue
			}
			visited[fragmentName] = true

			fragment := reqCtx.Doc.Fragments.ForName(fragmentName)
			if fragment == nil {
				// should never happen, validator has already run
				panic(fmt.Errorf("missing fragment %s", fragmentName))
			}

			if !instanceOf(fragment.TypeCondition, satisfies) {
				continue
			}

			for _, childField := range collectFields(reqCtx, fragment.SelectionSet, satisfies, visited) {
				f := getOrCreateField(&groupedFields, childField.Name, func() CollectedField { return childField })
				f.Selections = append(f.Selections, childField.Selections...)
			}

		default:
			panic(fmt.Errorf("unsupported %T", sel))
		}
	}

	return groupedFields
}

type CollectedField struct {
	*ast.Field

	Selections ast.SelectionSet
}

func instanceOf(val string, satisfies []string) bool {
	for _, s := range satisfies {
		if val == s {
			return true
		}
	}
	return false
}

func getOrCreateField(c *[]CollectedField, name string, creator func() CollectedField) *CollectedField {
	for i, cf := range *c {
		if cf.Alias == name {
			return &(*c)[i]
		}
	}

	f := creator()

	*c = append(*c, f)
	return &(*c)[len(*c)-1]
}

func shouldIncludeNode(directives ast.DirectiveList, variables map[string]interface{}) bool {
	skip, include := false, true

	if d := directives.ForName("skip"); d != nil {
		skip = resolveIfArgument(d, variables)
	}

	if d := directives.ForName("include"); d != nil {
		include = resolveIfArgument(d, variables)
	}

	return !skip && include
}

func resolveIfArgument(d *ast.Directive, variables map[string]interface{}) bool {
	arg := d.Arguments.ForName("if")
	if arg == nil {
		panic(fmt.Sprintf("%s: argument 'if' not defined", d.Name))
	}
	value, err := arg.Value.Value(variables)
	if err != nil {
		panic(err)
	}
	ret, ok := value.(bool)
	if !ok {
		panic(fmt.Sprintf("%s: argument 'if' is not a boolean", d.Name))
	}
	return ret
}
