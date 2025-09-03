interface ScribbleMessage {
  type: 'draw' | 'guess' | 'join' | 'leave' | 'word' | 'score' | 'turn';
  data: any;
  playerId: string;
  roomId: string;
}

interface DrawingData {
  x: number;
  y: number;
  isDrawing: boolean;
  isStart: boolean;
}

class ScribbleWebSocketService {
  private ws: WebSocket | null = null;
  private roomId: string = '';
  private playerId: string = '';
  private onMessageCallback: ((message: ScribbleMessage) => void) | null = null;

  connect(roomId: string, playerId: string, onMessage: (message: ScribbleMessage) => void) {
    this.roomId = roomId;
    this.playerId = playerId;
    this.onMessageCallback = onMessage;

    // For now, we'll simulate WebSocket with localStorage for demo
    // In production, you'd connect to a real WebSocket server
    console.log(`Connecting to room ${roomId} as player ${playerId}`);
    
    // Listen for storage events (simulating WebSocket messages)
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    // Check if this is the first player (host) or second player (guest)
    const roomKey = `scribble_room_${roomId}`;
    const existingData = localStorage.getItem(roomKey);
    
    if (!existingData) {
      // First player - this is the host (drawer)
      localStorage.setItem(roomKey, JSON.stringify({ hostId: playerId, guestId: null }));
      
      // Send join message as host
      this.sendMessage({
        type: 'join',
        data: { playerId, roomId, isHost: true, hostId: playerId },
        playerId,
        roomId
      });
    } else {
      // Second player - this is the guest (guesser)
      const roomData = JSON.parse(existingData);
      roomData.guestId = playerId;
      localStorage.setItem(roomKey, JSON.stringify(roomData));
      
      // Send join message as guest
      this.sendMessage({
        type: 'join',
        data: { playerId, roomId, isHost: false, hostId: roomData.hostId },
        playerId,
        roomId
      });
    }
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key?.startsWith(`scribble_${this.roomId}_`)) {
      try {
        const message = JSON.parse(event.newValue || '{}');
        if (message.roomId === this.roomId && message.playerId !== this.playerId) {
          this.onMessageCallback?.(message);
        }
      } catch (error) {
        console.error('Error parsing storage message:', error);
      }
    }
  }

  sendMessage(message: ScribbleMessage) {
    // Simulate WebSocket by storing in localStorage
    const key = `scribble_${this.roomId}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(message));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(message)
    }));
  }

  sendDrawing(data: DrawingData) {
    this.sendMessage({
      type: 'draw',
      data,
      playerId: this.playerId,
      roomId: this.roomId
    });
  }

  sendGuess(guess: string) {
    this.sendMessage({
      type: 'guess',
      data: { guess },
      playerId: this.playerId,
      roomId: this.roomId
    });
  }

  sendScoreUpdate(playerId: string, score: number) {
    this.sendMessage({
      type: 'score',
      data: { playerId, score },
      playerId: this.playerId,
      roomId: this.roomId
    });
  }

  sendTurnChange(currentPlayer: number) {
    this.sendMessage({
      type: 'turn',
      data: { currentPlayer },
      playerId: this.playerId,
      roomId: this.roomId
    });
  }

  sendWordUpdate(word: string) {
    this.sendMessage({
      type: 'word',
      data: { word },
      playerId: this.playerId,
      roomId: this.roomId
    });
  }

  disconnect() {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    this.sendMessage({
      type: 'leave',
      data: { playerId: this.playerId },
      playerId: this.playerId,
      roomId: this.roomId
    });
  }
}

export default new ScribbleWebSocketService();
