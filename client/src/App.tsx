import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import tw from './api/twelvelabs'

function App() {
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleAnalyzeUrl() {
    setLoading(true)
    try {
      const data = await tw.analyzeUrl(url)
      setTranscription(data?.transcription || JSON.stringify(data))
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!file) return alert('Choose a file first')
    setLoading(true)
    try {
      const data = await tw.uploadFile(file)
      setTranscription(data?.transcription || JSON.stringify(data))
    } catch (err: any) {
      alert('Upload error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSummarize() {
    if (!transcription) return alert('No transcription to summarize')
    setLoading(true)
    try {
      const s = await tw.summarize(transcription, undefined, true)
      setSummary(s)
    } catch (err: any) {
      alert('Summarize error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Video Analysis (Twelvelabs proxy)</h1>

      <section>
        <h3>Analyze by URL</h3>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Public video URL" style={{ width: 400 }} />
        <button onClick={handleAnalyzeUrl} disabled={loading}>Analyze URL</button>
      </section>

      <section>
        <h3>Upload file</h3>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button onClick={handleUpload} disabled={loading}>Upload & Analyze</button>
      </section>

      <section>
        <h3>Transcription</h3>
        <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{transcription ?? 'No transcription yet'}</pre>
        <button onClick={handleSummarize} disabled={loading || !transcription}>Summarize</button>
      </section>

      <section>
        <h3>Summary</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{summary ? JSON.stringify(summary, null, 2) : 'No summary yet'}</pre>
      </section>
    </div>
  )
}

export default App
