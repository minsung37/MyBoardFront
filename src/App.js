import logo from './logo.svg';
import './App.css';
import CreateReadChat from './pages/CreateReadChat'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/home'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/chat/:roomId' element={<CreateReadChat />}/>
      </Routes>
    </div>
  );
}


export default App;
