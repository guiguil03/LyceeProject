import { useState } from 'react'
import reactLogo from './assets/react.svg'
const viteLogo = '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="card max-w-md w-full text-center">
        <div className="flex justify-center space-x-8 mb-8">
          <a 
            href="https://vite.dev" 
            target="_blank" 
            className="transition-transform hover:scale-110"
          >
            <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
          </a>
          <a 
            href="https://react.dev" 
            target="_blank"
            className="transition-transform hover:scale-110"
          >
            <img src={reactLogo} className="h-16 w-16 animate-spin" alt="React logo" />
          </a>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          🎓 LyceeProject
        </h1>
        
        <div className="space-y-4">
          <button 
            className="btn-primary w-full"
            onClick={() => setCount((count) => count + 1)}
          >
            Compteur: {count}
          </button>
          
          <p className="text-gray-600">
            Éditer <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> pour tester HMR
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Système de gestion scolaire moderne avec React + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
