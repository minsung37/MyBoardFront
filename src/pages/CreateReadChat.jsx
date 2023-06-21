import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as StompJs from '@stomp/stompjs';


function CreateReadChat() {
  let [chatList, setChatList] = useState([]);
  let [chat, setChat] = useState('');
  let [name, setName] = useState('');

  const { roomId } = useParams();
  // const apply_id = 1;
  const client = useRef({});

  function connect() {
    client.current = new StompJs.Client({
      brokerURL: 'ws://localhost:5000/ws',
      onConnect: () => {
        console.log('success');
        subscribe();
      },
    });
    client.current.activate();
  };

  function publish(chat) {
    if (!client.current.connected) return;

    client.current.publish({
      destination: '/pub/chat',
      body: JSON.stringify({
        channelId: roomId,
        userId: 1,
        nickname: name,
        profileImg: "",
        chat: chat,
      }),
    });

    setChat('');
  };

  function subscribe() {
    client.current.subscribe('/sub/chat/' + roomId, (body) => {
      const json_body = JSON.parse(body.body);
      const message = json_body;
      setChatList((_chat_list) => [
        ..._chat_list, message
      ]);
    });
  };

  function disconnect() {
    client.current.deactivate();
  };

  function handleChange(event) { // 채팅 입력 시 state에 값 설정
    setChat(event.target.value);
  };

  function handleSubmit(event, chat) { // 보내기 버튼 눌렀을 때 publish
    event.preventDefault();
    publish(chat);
  };

  function nameChange(event) {
    setName(event.target.value);
  }
  
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return (
    <div>
      <h2>{roomId} 번 채팅방</h2>
      <div>
        이름설정 : &nbsp;
        <input type={'text'} onChange={nameChange} value={name} />
      </div>
      내이름 : {name}
      {
        chatList.map((item, index) => {
          return <div key={index}>{item.nickname} : {item.chat}</div>
        })
      }
      <br></br>
      <form onSubmit={(event) => handleSubmit(event, chat)}>
        <div>
          <input type={'text'} name={'chatInput'} onChange={handleChange} value={chat} />
        </div>
        <br></br>
        <input type={'submit'} value={'메시지 보내기'} />
      </form>
    </div>
  );
}


export default CreateReadChat;