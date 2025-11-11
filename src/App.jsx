import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [ocrPreview, setOcrPreview] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const [guest, setGuest] = useState({ full_name: '', phone: '', id_type: '', id_number: '' })
  const [guests, setGuests] = useState([])
  const [notify, setNotify] = useState({ channel: 'sms', to: '', message: '' })
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch(`${API}/test`).catch(() => {})
  }, [])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrPreview(URL.createObjectURL(file))
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API}/api/ocr`, { method: 'POST', body: form })
    const data = await res.json()
    setOcrResult(data)
    setGuest(g => ({ ...g, full_name: data.full_name || g.full_name, id_type: data.id_type || g.id_type, id_number: data.id_number || g.id_number }))
  }

  const saveGuest = async () => {
    const res = await fetch(`${API}/api/guests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(guest) })
    const data = await res.json()
    setToast('Guest saved')
    loadGuests()
    return data
  }

  const loadGuests = async () => {
    const res = await fetch(`${API}/api/guests`)
    const data = await res.json()
    setGuests(data)
  }

  const sendNotif = async () => {
    const res = await fetch(`${API}/api/notify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(notify) })
    const data = await res.json()
    setToast(`Notification ${data.status}`)
  }

  useEffect(() => { loadGuests() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">HotelOps Dashboard</h1>
          <span className="text-sm text-gray-500">Designed for speed and simplicity</span>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">ID Scan (Aadhaar/PAN)</h2>
            <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="block w-full" />
            {ocrPreview && <img src={ocrPreview} alt="preview" className="rounded border" />}
            {ocrResult && (
              <div className="text-sm text-gray-600">
                <div>Type: <b>{ocrResult.id_type}</b></div>
                <div>ID: <b>{ocrResult.id_number}</b></div>
                <div>Name: <b>{ocrResult.full_name}</b></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Guest Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <input value={guest.full_name} onChange={e=>setGuest({...guest, full_name:e.target.value})} placeholder="Full name" className="border rounded px-3 py-2" />
              <input value={guest.phone} onChange={e=>setGuest({...guest, phone:e.target.value})} placeholder="Phone (+91...)" className="border rounded px-3 py-2" />
              <input value={guest.id_type} onChange={e=>setGuest({...guest, id_type:e.target.value})} placeholder="ID Type" className="border rounded px-3 py-2" />
              <input value={guest.id_number} onChange={e=>setGuest({...guest, id_number:e.target.value})} placeholder="ID Number" className="border rounded px-3 py-2" />
            </div>
            <button onClick={saveGuest} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Save Guest</button>
            {toast && <div className="text-xs text-green-700">{toast}</div>}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Notify</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <select value={notify.channel} onChange={e=>setNotify({...notify, channel:e.target.value})} className="border rounded px-3 py-2">
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <input value={notify.to} onChange={e=>setNotify({...notify, to:e.target.value})} placeholder="Recipient (+91...)" className="border rounded px-3 py-2" />
            <input value={notify.message} onChange={e=>setNotify({...notify, message:e.target.value})} placeholder="Message" className="border rounded px-3 py-2" />
          </div>
          <button onClick={sendNotif} className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Send</button>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Guests</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {guests.map(g => (
              <div key={g._id} className="border rounded-lg p-4">
                <div className="font-semibold">{g.full_name || 'Unknown'}</div>
                <div className="text-sm text-gray-600">{g.phone || '—'}</div>
                <div className="text-xs text-gray-500">{g.id_type?.toUpperCase?.()}: {g.id_number || '—'}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
