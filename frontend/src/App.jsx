import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [resultSize, setResultSize] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState('webp')
  const [customName, setCustomName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [userOS, setUserOS] = useState('Unknown')
  const [userGPU, setUserGPU] = useState('Detectando...')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const platform = window.navigator.userAgent.toLowerCase();
    if (platform.includes('mac')) setUserOS('macOS');
    else if (platform.includes('win')) setUserOS('Windows');
    else if (platform.includes('android')) setUserOS('Android');
    else if (platform.includes('iphone') || platform.includes('ipad')) setUserOS('iOS');
    else setUserOS('Linux/Other');

    // Detect GPU
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          setUserGPU(renderer || 'Generic GPU');
        } else {
          setUserGPU('GPU Standard');
        }
      }
    } catch {
      setUserGPU('N/A');
    }
  }, [])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = (selectedFile) => {
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setResult(null)
    
    // Set default name (original filename without extension)
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "")
    setCustomName(`${nameWithoutExt}_no_bg`)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsHovering(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile)
    }
  }

  const handleRemoveBg = async () => {
    if (!file) return

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('output_format', selectedFormat)
    formData.append('client_os', userOS)

    try {
      // Backend is running on port 8000
      const response = await fetch('http://localhost:8000/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Falha ao processar imagem')

      const blob = await response.blob()
      setResult(URL.createObjectURL(blob))
      
      // Calculate size in KB or MB
      const sizeInKb = blob.size / 1024
      setResultSize(sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(2)} MB` : `${sizeInKb.toFixed(1)} KB`)
    } catch (error) {
      console.error(error)
      alert('Erro ao remover fundo. Verifique se o backend está rodando.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResult = (nameOverride = null) => {
    if (!result) return
    const link = document.createElement('a')
    link.href = result
    const extension = selectedFormat === 'svg' ? 'svg' : selectedFormat
    const fileName = (nameOverride || customName).trim() || `logo_no_bg_${Date.now()}`
    link.download = `${fileName}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setResultSize(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="App">
      <header>
        <h1>Logo Magic Remover <small style={{fontSize: '0.8rem', opacity: 0.5}}>v3.0 Ultra</small></h1>
        <p className="subtitle">Remova o fundo de qualquer logo instantaneamente com IA</p>
      </header>

      <main className="card-container">
        {!preview ? (
          <div 
            className={`drop-zone ${isHovering ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.587-1.587a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Arraste uma imagem ou clique para selecionar</p>
            <span style={{color: '#555', fontSize: '0.9rem'}}>Suporta PNG, JPG, WEBP, HEIC, BMP, TIFF...</span>
          </div>
        ) : (
          <div className="result-area">
            <div className="image-preview">
              <img src={preview} alt="Original" />
              <div style={{position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>Original</div>
            </div>

            <div className={`image-preview ${result ? 'checkerboard' : ''}`}>
              {isProcessing && (
                <div className="processing-overlay">
                  <span className="loader"></span>
                  <p>Removendo fundo...</p>
                </div>
              )}
              {result ? (
                <img src={result} alt="Resultado" />
              ) : (
                !isProcessing && <p style={{color: '#555'}}>Aguardando processamento...</p>
              )}
              <div style={{position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'}}>Processada</div>
              {resultSize && (
                <div style={{position: 'absolute', bottom: 10, right: 10, background: 'rgba(100,108,255,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                  {resultSize}
                </div>
              )}
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*"
        />

        <div className="actions" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '1rem'}}>
          {!result && !isProcessing && (
            <div className="format-selector">
              <label style={{display: 'block', fontSize: '0.8rem', color: 'white', marginBottom: '4px'}}>Formato de Saída:</label>
              <select 
                value={selectedFormat} 
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="select-premium"
              >
                <option value="webp">WEBP (Ultra Leve)</option>
                <option value="png">PNG (Transparência HD)</option>
                <option value="jpg">JPG (Fundo Branco)</option>
                <option value="svg">SVG (Vetor AI)</option>
                <option value="tiff">TIFF (Profissional)</option>
                <option value="bmp">BMP (Legado)</option>
              </select>
            </div>
          )}

          {preview && !result && !isProcessing && (
            <button className="btn-primary" onClick={handleRemoveBg} style={{alignSelf: 'flex-end'}}>Remover Fundo Agora</button>
          )}
          {result && (
            <button className="btn-primary" onClick={() => setShowModal(true)} style={{alignSelf: 'flex-end'}}>
              Download {selectedFormat.toUpperCase()}
            </button>
          )}

          {preview && !isProcessing && (
            <button className="btn-primary" style={{background: 'rgba(255,255,255,0.05)', color: '#ccc', boxShadow: 'none', alignSelf: 'flex-end'}} onClick={reset}>Nova Imagem</button>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Salvar Imagem</h3>
            <p style={{fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem'}}>Escolha um nome para sua logo processada.</p>
            
            <div className="format-selector" style={{width: '100%', marginBottom: '2rem'}}>
              <label style={{display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '8px'}}>Nome do Arquivo</label>
              <input 
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="select-premium"
                style={{width: '100%'}}
                placeholder="Ex: minha_logo"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    downloadResult();
                    setShowModal(false);
                  }
                }}
              />
            </div>

            <div style={{display: 'flex', gap: '1rem', width: '100%'}}>
              <button 
                className="btn-primary" 
                style={{flex: 1, background: 'rgba(255,255,255,0.05)', color: '#ccc', boxShadow: 'none'}} 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                style={{flex: 1}} 
                onClick={() => {
                  downloadResult();
                  setShowModal(false);
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{marginTop: '4rem', color: 'white'}}>
        <div style={{marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <span style={{background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <svg style={{width: '14px', height: '14px', color: '#666'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            OS: <strong>{userOS}</strong>
          </span>
          <span style={{background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <svg style={{width: '14px', height: '14px', color: '#666'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            GPU: <strong style={{fontSize: '0.65rem'}}>{userGPU}</strong>
          </span>
          <span style={{background: 'rgba(100,108,255,0.1)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(100,108,255,0.2)', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <svg style={{width: '14px', height: '14px', color: '#818cf8'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            IA: <strong>{userGPU.includes('NVIDIA') ? 'CUDA Enabled' : (userOS === 'macOS' ? 'Apple M3 Neural' : 'Accelerated')}</strong>
          </span>
        </div>
        <p>Desenvolvido por: <a href="https://munizvr.vercel.app" target="_blank" rel="noopener noreferrer" style={{color: '#646cff', textDecoration: 'underline', fontWeight: 'bold'}}>Victor Muniz</a></p>
      </footer>
    </div>
  )
}

export default App
