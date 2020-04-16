package mini

import (
	"sync"
	"time"

	"github.com/gdamore/tcell"
	"github.com/rivo/tview"
)

type historyMessageList struct {
	lock          sync.RWMutex
	historyScroll *tview.Table
	app           *tview.Application
}

func newHistoryMessageList(app *tview.Application) *historyMessageList {
	return &historyMessageList{
		historyScroll: tview.NewTable(),
		app:           app,
	}
}

func (h *historyMessageList) View() *tview.Table {
	h.lock.RLock()
	defer h.lock.RUnlock()

	return h.historyScroll
}

func (h *historyMessageList) AppendErr(err error) {
	if err == nil {
		return
	}

	h.Append(&historyMessage{
		messageType: messageTypeError,
		payload:     []byte(err.Error()),
	})
}

func (h *historyMessageList) Append(m *historyMessage) {
	h.lock.Lock()
	defer h.lock.Unlock()

	if m.receivedAt.IsZero() {
		m.receivedAt = time.Now()
	}

	row := h.historyScroll.GetRowCount()
	h.historyScroll.SetCellSimple(row, 0, m.Timestamp())
	h.historyScroll.SetCellSimple(row, 1, m.Sender())
	h.historyScroll.SetCellSimple(row, 2, m.Text())

	for i := 0; i < 3; i++ {
		cell := h.historyScroll.GetCell(row, i)
		if m.messageType == messageTypeError {
			cell.SetTextColor(tcell.ColorOrangeRed)
		} else if m.messageType == messageTypeMeta {
			cell.SetTextColor(tcell.ColorLimeGreen)
		}
	}

	h.historyScroll.ScrollToEnd()
	go h.app.Draw()
}

func (h *historyMessageList) Prepend(m *historyMessage, receivedAt time.Time) {
	h.lock.Lock()
	defer h.lock.Unlock()

	if receivedAt.IsZero() {
		m.receivedAt = time.Now()
	}

	h.historyScroll.InsertRow(0)
	h.historyScroll.SetCellSimple(0, 0, m.Timestamp())
	h.historyScroll.SetCellSimple(0, 1, m.Sender())
	h.historyScroll.SetCellSimple(0, 2, m.Text())
	go h.app.Draw()
}
