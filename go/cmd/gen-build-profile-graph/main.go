package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"path"
	"path/filepath"
	"time"

	"github.com/goccy/go-graphviz"
	"github.com/goccy/go-graphviz/cgraph"
)

const profilPath = ".build-info/.meta/profil"

type profile struct {
	Deps           []string      `json:"deps"`
	TotalDuration  time.Duration `json:"totalDuration"`
	ImplemDuration time.Duration `json:"implemDuration"`
	DepsDuration   time.Duration `json:"depsDuration"`
}

type elem struct {
	p profile
	n *cgraph.Node
}

func main() {
	g := graphviz.New()
	graph, err := g.Graph()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := graph.Close(); err != nil {
			log.Fatal(err)
		}
		g.Close()
	}()

	elems := make(map[string]elem)
	files, err := filepath.Glob(profilPath + "/*")
	if err != nil {
		log.Fatal(err)
	}
	for _, f := range files {
		b, err := ioutil.ReadFile(f)
		if err != nil {
			log.Fatal(err)
		}
		var p profile
		if err := json.Unmarshal(b, &p); err != nil {
			log.Fatal(err)
		}

		id := path.Base(f)

		n, err := graph.CreateNode(id)
		if err != nil {
			log.Fatal(err)
		}
		n.SetLabel(fmt.Sprintf("%s\n%v", id, p.TotalDuration))

		elems[id] = elem{p, n}
	}

	for _, e := range elems {
		for _, d := range e.p.Deps {
			o, ok := elems[d]
			var on *cgraph.Node
			if ok {
				on = o.n
			} else {
				n, err := graph.CreateNode(d)
				if err != nil {
					log.Fatal(err)
				}
				on = n
				elems[d] = elem{profile{}, n}
			}
			_, err := graph.CreateEdge("", e.n, on)
			if err != nil {
				log.Fatal(err)
			}
		}
	}

	if err := g.RenderFilename(graph, graphviz.SVG, "build-profile.svg"); err != nil {
		log.Fatal(err)
	}
}
