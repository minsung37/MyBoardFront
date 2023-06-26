import logo from './logo.svg';
import './App.css';
import ChatPage from './pages/ChatPage'
import { Route, Routes } from 'react-router-dom';
import Home from './pages/WelcomePage'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/chat/:roomId' element={<ChatPage />}/>
      </Routes>
    </div>
  );
}


export default App;
