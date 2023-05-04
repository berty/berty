package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type TargetData struct {
	Targets []string          `json:"targets"`
	Labels  map[string]string `json:"labels"`
}

type ServiceDiscovery struct {
	ctx    context.Context
	cancel context.CancelFunc

	targets  map[string]*TargetData
	muTarget sync.RWMutex
}

func (s *ServiceDiscovery) discoveryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	s.muTarget.RLock()
	defer s.muTarget.RUnlock()

	data := make([]*TargetData, len(s.targets))
	i := 0
	for _, t := range s.targets {
		data[i] = t
		i++
	}

	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (s *ServiceDiscovery) addTargetHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	target := r.URL.Query().Get("target")
	labels := r.URL.Query().Get("labels")

	s.muTarget.Lock()
	defer s.muTarget.Unlock()

	addr, err := net.ResolveTCPAddr("tcp", target)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if s.targets[addr.String()] != nil {
		http.Error(w, "target already added", http.StatusInternalServerError)
		return
	}

	t := &TargetData{
		Targets: []string{addr.String()},
		Labels:  map[string]string{},
	}

	for _, pairs := range strings.Split(labels, ",") {
		if label := strings.Split(pairs, ":"); len(label) == 2 {
			t.Labels[label[0]] = label[1]
		}
	}

	log.Printf("added target: %s (labels=%v)", addr.String(), labels)

	s.targets[addr.String()] = t
	go func() {
		defer func() {
			s.muTarget.Lock()
			log.Printf("`%s` is down, removing", addr.String())
			delete(s.targets, addr.String())
			s.muTarget.Unlock()
		}()

		metricsurl := fmt.Sprintf("http://%s/metrics", addr.String())
		for {
			select {
			case <-time.After(time.Second * 5):
			case <-s.ctx.Done():
				return
			}

			ctx, cancel := context.WithTimeout(s.ctx, time.Second*2)
			req, err := http.NewRequestWithContext(ctx, http.MethodGet, (metricsurl), nil)
			if err != nil {
				cancel()
				log.Printf("error creating request: %s", err)
				return
			}

			resp, err := http.DefaultClient.Do(req)
			cancel()
			if err != nil {
				// handle error
				log.Printf("fetching(%s) error: %s\n", addr.String(), err)
				return
			}

			if resp.StatusCode < 200 || resp.StatusCode >= 300 {
				fmt.Printf("host(%s): invalid status code %d\n", addr.String(), resp.StatusCode)
			}
		}
	}()

	ret := struct {
		Target string `json:"target"`
		Status string `json:"status"`
	}{addr.String(), "ok"}

	err = json.NewEncoder(w).Encode(ret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (s *ServiceDiscovery) Close() {
	s.cancel()
}

func main() {
	portPtr := flag.String("port", "8080", "port number to listen on")
	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	ds := &ServiceDiscovery{
		ctx: ctx, cancel: cancel,
		targets: map[string]*TargetData{},
	}
	defer ds.cancel()

	http.HandleFunc("/discovery", ds.discoveryHandler)
	http.HandleFunc("/addtarget", ds.addTargetHandler)

	address := fmt.Sprintf(":%s", *portPtr)
	fmt.Printf("Listening on http://localhost%s\n", address)

	if err := http.ListenAndServe(address, nil); err != nil {
		log.Fatal(err)
	}
}
