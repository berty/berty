package WIP

import (
	"fmt"
	"runtime"
	"strconv"
	"strings"
	"sync"
)

var (
	Lock sync.Mutex
	Map  = make(map[string]struct{})
	RID  = make(map[string]int)
	RID2 = make(map[string]int)
)

func Goid() int {
	var buf [64]byte
	n := runtime.Stack(buf[:], false)
	idField := strings.Fields(strings.TrimPrefix(string(buf[:n]), "goroutine "))[0]
	id, err := strconv.Atoi(idField)
	if err != nil {
		panic(fmt.Sprintf("cannot get goroutine id: %v", err))
	}
	return id
}
