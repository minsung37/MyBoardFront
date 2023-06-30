import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as StompJs from '@stomp/stompjs';
import style from "./ChatPage.module.css"


function CreateReadChat() {

  // 바뀌면 렌더링
  let [chatList, setChatList] = useState([]);
  let [userList, setUserList] = useState([]);
  let [chat, setChat] = useState('');
  let [name, setName] = useState('');
  let [naming, setNaming] = useState(true);

  // 파라미터 값 받기
  const { roomId } = useParams();
  
  // 값을 변경해도 상태를 변경할 때 처럼 컴포넌트가 다시 랜더링되지 않는다
  // 컴포넌트가 다시 랜더링될 때도 마찬가지로 이 current 속성의 값이 유실되지 않는다
  const client = useRef({});

  // ws://localhost:8080/ws 이곳과 연결
  function connect() {
    client.current = new StompJs.Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        console.log('success');
        subscribe();
        welcome();
        bye();
      },
    });
    client.current.activate();
  };
  
  // 서버의 /sub/chat/roomId 로 메시지 보내기
  function publish(chat) {
    if (!client.current.connected) return;

    client.current.publish({
      destination: '/pub/chat',
      body: JSON.stringify({
        roomId: roomId,
        userId: 1,
        nickname: name,
        profileImg: "",
        chat: chat,
      }),
    });

    setChat('');
  };

  // 서버가 /sub/chat/roomId 로 보낸 메시지 받기
  function subscribe() {
    client.current.subscribe('/sub/chat/' + roomId, (body) => {
      const json_body = JSON.parse(body.body);
      const message = json_body;
      setChatList((_chat_list) => [
        ..._chat_list, message
      ]);
    });
  };

  // 연결 종료
  function disconnect() {
    client.current.deactivate();
  };

  // 채팅 입력 시 state에 값 설정
  function handleChange(event) {
    setChat(event.target.value);
  };

  // 보내기 버튼 눌렀을 때 publish
  function handleSubmit(event, chat) {
    event.preventDefault();
    publish(chat);
  };

  // 이름설정
  function joinChat() {
    setNaming(false);
    localStorage.setItem("name", name)
    sendWelcome({
      roomId: roomId,
      userId: 1,
      nickname: name,
      profileImg: "welcome",
      chat: chat,
    })
  }

  // 인풋상자랑 바운딩
  function nameChange(event) {
    setName(event.target.value);
  }
  
  // mounted
  useEffect(() => {
    connect();

    // unmounted
    return () => {
      console.log("bye")
      sendbye();
      disconnect();
    }
  }, []);

  // 아래 함수는 publish, subscribe와 비슷한 과정
  function sendbye() {
    if (!client.current.connected) return;
    console.log("send bye")
    let name1 = localStorage.getItem("name")
    client.current.publish({
      destination: '/pub/bye',
      body: JSON.stringify({
        roomId: roomId,
        nickname: name1,
      }),
    });
  };

  function bye() {
    console.log("conn bye")
    client.current.subscribe('/sub/bye/' + roomId, (body) => {
      const json_body = JSON.parse(body.body);
      const message = json_body;
      setUserList(message.participants);
    });
  };


  function sendWelcome() {
    if (!client.current.connected) return;

    client.current.publish({
      destination: '/pub/welcome',
      body: JSON.stringify({
        roomId: roomId,
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
      setUserList(message.participants);
    });
  };

  return (
    <div>
      <h2>{roomId} 번 채팅방</h2>
      <hr></hr>
      참여 유저 : { userList.length } 명
      <br></br>
      <div className={style.other}>
        {
          userList.map((item, index) => {
            return(
              <div className={style.name} key={index}>
                {item}
              </div>
            )
          })
        }
      </div>
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