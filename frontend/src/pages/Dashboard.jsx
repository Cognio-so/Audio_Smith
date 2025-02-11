import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';

const Dashboard = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `Chat ${chats.length + 1}`,
      isNew: true
    };
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat);
  };

  const updateChatTitle = (chatId, newTitle) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId && chat.isNew
          ? { ...chat, title: newTitle, isNew: false }
          : chat
      )
    );
  };

  return (
    <div className="flex h-screen" 
      style={{
        background: 'linear-gradient(to left, #414345, #232526)'
      }}>
      <Sidebar 
        chats={chats} 
        activeChat={activeChat}
        setActiveChat={setActiveChat} 
        createNewChat={createNewChat} 
      />
      {(activeChat || chats.length === 0) && (
        <ChatContainer 
          activeChat={activeChat} 
          onUpdateChatTitle={(newTitle) => updateChatTitle(activeChat.id, newTitle)}
        />
      )}
    </div>
  );
};

export default Dashboard;
