import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Home() {
  
  let [roomId, setRoomId] = useState(1);
  let navigate = useNavigate();

  function changeRoomId(event) {
    setRoomId(event.target.value);
  }

  // 채팅방입장
  function enterRoom() {
    // 라우터
    navigate("/chat/" + roomId)
  }

  return(
    <>
      <h2>
        {roomId}번 채팅방 입장하기
      </h2>
      <input onChange={changeRoomId} value={roomId}></input><br></br><br></br>
      <button onClick={enterRoom}>입장</button>
    </>
  )
}


export default Home;