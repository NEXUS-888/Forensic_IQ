import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Create image preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/analyze/image', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Error analyzing image:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0])
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/analyze/audio', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Error analyzing audio:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleTextAnalysis = async () => {
    if (!text) return
    
    const formData = new FormData()
    formData.append('text', text)
    
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/analyze/text', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error analyzing text:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cleanup function for image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  return (
    <div className="min-h-screen bg-blue-50 py-6 flex flex-col justify-center sm:py-12">
      <div className="absolute top-0 w-full bg-gradient-to-r from-blue-600 via-blue-800 to-blue-900 p-6 shadow-lg">
        <h1 className="text-5xl font-bold text-center text-white tracking-wider">
          Forensic 
          <span className="text-blue-300 ml-2 font-extrabold">IQ</span>
        </h1>
        <div className="text-center mt-1">
          <span className="text-blue-200 text-sm tracking-wider">Advanced AI-Powered Crime Scene Analysis</span>
        </div>
      </div>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto mt-16">
        <div className="relative px-4 py-10 bg-gradient-to-b from-white to-blue-50 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-blue-100">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {/* Image Analysis Section */}
                <div className="mb-12 relative">
                  <h2 
                    className="text-xl font-semibold mb-4 text-blue-900 cursor-help inline-block hover:text-blue-700 transition-colors duration-200"
                    onMouseEnter={() => setActiveTooltip('image')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    Image Analysis
                  </h2>
                  <div 
                    className={`
                      absolute z-10 bg-white p-4 rounded-lg shadow-lg border border-blue-200 
                      transition-all duration-300 ease-in-out
                      ${activeTooltip === 'image' 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'}
                      mt-2 w-full max-w-sm
                    `}
                  >
                    <p className="text-sm text-gray-600">
                      Upload crime scene photos for AI-powered analysis. Our system will:
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>Detect and identify objects</li>
                        <li>Analyze potential evidence</li>
                        <li>Assess environmental conditions</li>
                        <li>Identify safety concerns</li>
                        <li>Provide detailed forensic insights</li>
                      </ul>
                    </p>
                  </div>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full p-4 border-2 rounded-lg bg-blue-50 border-blue-200 
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none 
                        transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white hover:file:bg-blue-700
                        file:cursor-pointer file:transition-colors file:duration-200"
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 to-blue-50 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  {imagePreview && (
                    <div className="mt-6 transform transition-all duration-300 hover:scale-[1.02]">
                      <h4 className="font-semibold mb-3 text-blue-900">Uploaded Image:</h4>
                      <div className="relative w-full h-64 bg-white rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                        <img
                          src={imagePreview}
                          alt="Uploaded image"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Analysis Section */}
                <div className="mb-12 relative">
                  <h2 
                    className="text-xl font-semibold mb-4 text-blue-900 cursor-help inline-block hover:text-blue-700 transition-colors duration-200"
                    onMouseEnter={() => setActiveTooltip('audio')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    Audio Analysis
                  </h2>
                  <div 
                    className={`
                      absolute z-10 bg-white p-4 rounded-lg shadow-lg border border-blue-200 
                      transition-all duration-300 ease-in-out
                      ${activeTooltip === 'audio' 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'}
                      mt-2 w-full max-w-sm
                    `}
                  >
                    <p className="text-sm text-gray-600">
                      Process audio recordings with advanced AI. The system will:
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>Transcribe spoken content</li>
                        <li>Analyze emotional tone</li>
                        <li>Identify potential threats</li>
                        <li>Extract key discussion points</li>
                        <li>Provide context analysis</li>
                      </ul>
                    </p>
                  </div>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="w-full p-4 border-2 rounded-lg bg-blue-50 border-blue-200 
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none 
                        transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0 file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white hover:file:bg-blue-700
                        file:cursor-pointer file:transition-colors file:duration-200"
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 to-blue-50 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>

                {/* Text Analysis Section */}
                <div className="mb-12 relative">
                  <h2 
                    className="text-xl font-semibold mb-4 text-blue-900 cursor-help inline-block hover:text-blue-700 transition-colors duration-200"
                    onMouseEnter={() => setActiveTooltip('text')}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    Text Analysis
                  </h2>
                  <div 
                    className={`
                      absolute z-10 bg-white p-4 rounded-lg shadow-lg border border-blue-200 
                      transition-all duration-300 ease-in-out
                      ${activeTooltip === 'text' 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'}
                      mt-2 w-full max-w-sm
                    `}
                  >
                    <p className="text-sm text-gray-600">
                      Analyze written reports and documents. Our AI will:
                      <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>Extract key findings</li>
                        <li>Identify red flags</li>
                        <li>Provide contextual analysis</li>
                        <li>Suggest recommended actions</li>
                        <li>Assess priority level</li>
                      </ul>
                    </p>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full p-4 border-2 rounded-lg bg-blue-50 border-blue-200 
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none 
                        transition-all duration-200 resize-y min-h-[120px]
                        placeholder:text-blue-400"
                      placeholder="Enter text for analysis..."
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-100 to-blue-50 
                      rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <button
                    onClick={handleTextAnalysis}
                    className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5
                      font-semibold text-sm tracking-wide"
                  >
                    Analyze Text
                  </button>
                </div>

                {/* Results Section */}
                {loading && (
                  <div className="text-center text-blue-600 animate-pulse">
                    <p className="text-lg font-semibold">Analyzing...</p>
                  </div>
                )}
                
                {results && !loading && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-900">Analysis Results</h3>
                    
                    {/* Display caption if available */}
                    {results.caption && (
                      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-blue-900">Caption:</h4>
                        <p className="mt-1 text-gray-700">{results.caption}</p>
                      </div>
                    )}
                    
                    {/* Display transcript if available */}
                    {results.transcript && (
                      <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-blue-900">Transcript:</h4>
                        <p className="mt-1 text-gray-700">{results.transcript}</p>
                      </div>
                    )}
                    
                    {/* Display analysis */}
                    {results.analysis && (
                      <div>
                        <h4 className="font-semibold text-blue-900">Analysis:</h4>
                        <div className="mt-2 space-y-4">
                          {results.analysis.split('\n\n').map((section: string, index: number) => {
                            const cleanSection = section
                              .replace(/\*\*/g, '')
                              .replace(/\n\*/g, '\n•')
                              .trim();
                            
                            if (cleanSection) {
                              return (
                                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                                  {cleanSection.split('\n').map((line: string, lineIndex: number) => (
                                    <p key={lineIndex} className={`${line.startsWith('•') ? 'ml-4' : ''} text-gray-700`}>
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 