import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import ChatBasedGameSystem from './components/ChatBasedGameSystem';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  return (
    <div>
      <ChatBasedGameSystem roomId={roomId} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatBasedGameSystem />} />
      <Route path="/room/:roomId" element={<RoomPage />} />
    </Routes>
  );
};

export default App;
