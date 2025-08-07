import './App.css'
import CoursePlayer from './pages/CoursePlayer'
import Home from './pages/Home'
import { HashRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/course' element={<CoursePlayer />} />
      </Routes>
    </HashRouter>
  )
}

export default App
