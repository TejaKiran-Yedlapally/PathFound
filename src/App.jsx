
import './App.css'
import CoursePlayer from './pages/CoursePlayer'
import Home from './pages/Home'
import { BrowserRouter,Routes,Route } from 'react-router-dom'

function App() {

  return(
    <>
    <BrowserRouter>
           <Routes>
             <Route path='/PathFound' element={<Home/>} />
             <Route path='/course' element={<CoursePlayer/>} />
           </Routes>
    </BrowserRouter>
         
    </>
  )
  
 
}

export default App
