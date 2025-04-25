import React, { useState, useEffect } from 'react'
import './App.css'

// Add LoadingSpinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-blue-600 text-lg font-semibold">Processing...</span>
  </div>
)

// Add ErrorMessage component
const ErrorMessage = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">Error! </strong>
    <span className="block sm:inline">{message}</span>
    <button onClick={onClose} className="absolute top-0 right-0 px-4 py-3">
      <span className="sr-only">Close</span>
      <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
      </svg>
    </button>
  </div>
)

// Add ProgressBar component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-blue-100 rounded-full h-2.5 mb-4">
    <div 
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
)

// Add FileUploadBox component
const FileUploadBox = ({ 
  type, 
  accept, 
  onChange, 
  formats, 
  maxSize 
}: { 
  type: string; 
  accept: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  formats: string;
  maxSize: string;
}) => (
  <div className="relative group">
    <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-blue-600 font-medium">Drop your {type} here, or click to browse</p>
          <p className="text-sm text-blue-400 mt-2">
            {formats} • Max size: {maxSize}
          </p>
        </div>
      </div>
    </div>
  </div>
)

// Add ResultCard component
const ResultCard = ({ title, content }: { title: string; content: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
    <h4 className="font-semibold text-blue-900 mb-2">{title}</h4>
    <p className="text-gray-700">{content}</p>
  </div>
)

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Update the validateFile function
  const validateFile = (file: File, type: 'image' | 'audio') => {
    const maxSize = type === 'image' ? 20 * 1024 * 1024 : 50 * 1024 * 1024; // 20MB for images, 50MB for audio
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    if (type === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)');
      }
    } else if (type === 'audio') {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid audio file (MP3, WAV, or M4A)');
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        validateFile(file, 'image')
        
        setImageFile(file)
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
        
        const formData = new FormData()
        formData.append('file', file)
        
        setLoading(true)
        setError(null)
        setUploadProgress(0)
        
        // Start progress simulation
        simulateProgress()
        
        console.log('Sending image analysis request...')
        const response = await fetch('http://localhost:8000/analyze/image', {
          method: 'POST',
          body: formData,
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.error('Error response:', errorData)
          throw new Error(errorData?.detail || `Error: ${response.statusText}`);
        }
        
        const data = await response.json()
        console.log('Analysis results:', data)
        
        if (!data || (!data.caption && !data.analysis)) {
          throw new Error('Invalid response format from server');
        }
        
        setResults(data)
        setUploadProgress(100)
      }
    } catch (error) {
      console.error('Error analyzing image:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while processing the image')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        validateFile(file, 'audio')
        
        setAudioFile(file)
        const formData = new FormData()
        formData.append('file', file)
        
        setLoading(true)
        setError(null)
        setUploadProgress(0)
        
        // Start progress simulation
        simulateProgress()
        
        console.log('Sending audio analysis request...')
        const response = await fetch('http://localhost:8000/analyze/audio', {
          method: 'POST',
          body: formData,
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.error('Error response:', errorData)
          throw new Error(errorData?.detail || `Error: ${response.statusText}`);
        }
        
        const data = await response.json()
        console.log('Analysis results:', data)
        
        if (!data || (!data.transcript && !data.analysis)) {
          throw new Error('Invalid response format from server');
        }
        
        setResults(data)
        setUploadProgress(100)
      }
    } catch (error) {
      console.error('Error analyzing audio:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while processing the audio')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleTextAnalysis = async () => {
    try {
      if (!text.trim()) {
        throw new Error('Please enter some text to analyze');
      }
      
      const formData = new FormData()
      formData.append('text', text)
      
      setLoading(true)
      setError(null)
      setUploadProgress(0)
      
      // Start progress simulation
      simulateProgress()
      
      console.log('Sending text analysis request...')
      const response = await fetch('http://localhost:8000/analyze/text', {
        method: 'POST',
        body: formData,
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('Error response:', errorData)
        throw new Error(errorData?.detail || `Error: ${response.statusText}`);
      }
      
      const data = await response.json()
      console.log('Analysis results:', data)
      
      if (!data || !data.analysis) {
        throw new Error('Invalid response format from server');
      }
      
      setResults(data)
      setUploadProgress(100)
    } catch (error) {
      console.error('Error analyzing text:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while processing the text')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const simulateProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 500)
    return () => clearInterval(interval)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-6 flex flex-col justify-center sm:py-12">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      
      {/* Header */}
      <div className="absolute top-0 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 p-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-white tracking-wider mb-2">
            Forensic 
            <span className="text-blue-300 ml-2 font-extrabold">IQ</span>
          </h1>
          <div className="text-center">
            <span className="text-blue-200 text-lg tracking-wider">Advanced AI-Powered Crime Scene Analysis</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative py-3 sm:max-w-4xl sm:mx-auto mt-24">
        <div className="relative px-4 py-10 bg-white shadow-xl sm:rounded-3xl sm:p-20">
          <div className="max-w-3xl mx-auto">
            <div className="divide-y divide-blue-100">
              <div className="py-8 text-base leading-6 space-y-8 text-gray-700 sm:text-lg sm:leading-7">
                
                {/* Image Analysis Section */}
                <div className="mb-12 relative transform hover:scale-[1.01] transition-transform duration-200">
                  <h2 
                    className="text-2xl font-semibold mb-6 text-blue-900 cursor-help inline-block hover:text-blue-700 transition-colors duration-200"
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
                    <div className="text-sm text-gray-600">
                      <p>Upload crime scene photos for AI-powered analysis.</p>
                      <div className="mt-2">
                        Our system will:
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li>Detect and identify objects</li>
                          <li>Analyze potential evidence</li>
                          <li>Assess environmental conditions</li>
                          <li>Identify safety concerns</li>
                          <li>Provide detailed forensic insights</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <FileUploadBox
                    type="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    formats="JPEG, PNG, GIF"
                    maxSize="20MB"
                  />
                  {imagePreview && (
                    <div className="mt-6 transform transition-all duration-300">
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
                <div className="mb-12 relative transform hover:scale-[1.01] transition-transform duration-200">
                  <h2 
                    className="text-2xl font-semibold mb-6 text-blue-900 cursor-help inline-block hover:text-blue-700 transition-colors duration-200"
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
                    <div className="text-sm text-gray-600">
                      <p>Process audio recordings with advanced AI.</p>
                      <div className="mt-2">
                        The system will:
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li>Transcribe spoken content</li>
                          <li>Analyze emotional tone</li>
                          <li>Identify potential threats</li>
                          <li>Extract key discussion points</li>
                          <li>Provide context analysis</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <FileUploadBox
                    type="audio"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    formats="MP3, WAV, M4A"
                    maxSize="50MB"
                  />
                </div>

                {/* Text Analysis Section */}
                <div className="mb-12 relative transform hover:scale-[1.01] transition-transform duration-200">
                  <h2 
                    className="text-2xl font-semibold mb-6 text-blue-900 cursor-help inline-block hover:text-blue-700 transition-colors duration-200"
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
                    <div className="text-sm text-gray-600">
                      <p>Analyze written reports and documents.</p>
                      <div className="mt-2">
                        Our AI will:
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li>Extract key findings</li>
                          <li>Identify red flags</li>
                          <li>Provide contextual analysis</li>
                          <li>Suggest recommended actions</li>
                          <li>Assess priority level</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full p-4 border-2 rounded-lg bg-white border-blue-200 
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none 
                        transition-all duration-200 resize-y min-h-[120px] shadow-sm
                        placeholder:text-blue-300"
                      placeholder="Enter your text for analysis..."
                    />
                    <p className="mt-2 text-sm text-blue-600">
                      <span className="font-medium">Max length:</span> 10,000 characters
                    </p>
                    <button
                      onClick={handleTextAnalysis}
                      className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                        transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5
                        font-semibold tracking-wide flex items-center justify-center space-x-2"
                    >
                      <span>Analyze Text</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                {loading ? (
                  <div className="mt-8 p-8 bg-white rounded-lg border border-blue-200 shadow-sm">
                    <LoadingSpinner />
                    <ProgressBar progress={uploadProgress} />
                  </div>
                ) : results ? (
                  <div className="mt-8 p-6 bg-white rounded-lg border border-blue-200 shadow-lg transform transition-all duration-300">
                    <h3 className="text-2xl font-semibold mb-6 text-blue-900">Analysis Results</h3>
                    
                    <div className="space-y-6">
                      {results.caption && (
                        <ResultCard title="Caption" content={results.caption} />
                      )}
                      
                      {results.transcript && (
                        <ResultCard title="Transcript" content={results.transcript} />
                      )}
                      
                      {results.analysis && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-blue-900 text-xl mb-4">Analysis</h4>
                          {results.analysis.split('\n\n').map((section: string, index: number) => {
                            const cleanSection = section
                              .replace(/\*\*/g, '')
                              .replace(/\n\*/g, '\n•')
                              .trim();
                            
                            if (cleanSection) {
                              return (
                                <div key={index} 
                                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md 
                                    transition-shadow duration-200 border border-blue-50"
                                >
                                  {cleanSection.split('\n').map((line: string, lineIndex: number) => (
                                    <p key={lineIndex} 
                                      className={`${line.startsWith('•') ? 'ml-4 mt-2' : 'font-medium'} 
                                        text-gray-700 leading-relaxed`}
                                    >
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 