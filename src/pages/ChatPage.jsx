import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as StompJs from '@stomp/stompjs';
import style from "./ChatPage.module.css"


function CreateReadChat() {
  let [chatList, setChatList] = useState([]);
  let [userList, setUserList] = useState([]);
  let [chat, setChat] = useState('');
  let [name, setName] = useState('');
  let [naming, setNaming] = useState(true);

  const { roomId } = useParams();
  const client = useRef({});

  function connect() {
    client.current = new StompJs.Client({
      brokerURL: 'ws://localhost:5000/ws',
      onConnect: () => {
        console.log('success');
        subscribe();
        welcome();
      },
    });
    client.current.activate();
  };

  function sendWelcome(chat) {
    if (!client.current.connected) return;

    client.current.publish({
      destination: '/pub/welcome',
      body: JSON.stringify({
        channelId: roomId,
        userId: 1,
        nickname: name,
        profileImg: "welcome",
        chat: "1",
      }),
    });
  };

  function welcome() {
    console.log("welcome")
    client.current.subscribe('/sub/welcome/' + roomId, (body) => {
      console.log("getsub")
      const json_body = JSON.parse(body.body);
      const message = json_body;
      setUserList((_user_list) => [
        ..._user_list, message.nickname
      ]);
    });
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

  function joinChat() {
    setNaming(false);
    sendWelcome({
      channelId: roomId,
      userId: 1,
      nickname: name,
      profileImg: "welcome",
      chat: chat,
    })
  }

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
      <hr></hr>
      참여 유저 : { userList.length } 명
      <br></br>
      {userList}
      <br></br>
      <hr></hr>
      {
        naming ?
        <div>
          이름설정 : &nbsp;
          <input type={'text'} onChange={nameChange} value={name} />
          <button onClick={() => { joinChat() }}>완료</button>
        </div>
        : null
      }
      내이름 : {name}
      {
        chatList.map((item, index) => {
          return <div key={index}>{item.nickname} : {item.chat}</div>
        })
      }
      <br></br>
      {
        naming ? null:
        <div className={style.messages}>
          <form className={style.send} onSubmit={(event) => handleSubmit(event, chat)}>
            <input className={style.input} placeholder="메시지를 입력하세요" type={'text'} onChange={handleChange} value={chat} />
            <button className={style.btn} type={'submit'}>
              <img src="https://fitsta-bucket.s3.ap-northeast-2.amazonaws.com/secondlife/send.png"
                className={style.sendImg}
              />
            </button>
          </form>
        </div>
      }
    </div>
  );
}


export default CreateReadChat;