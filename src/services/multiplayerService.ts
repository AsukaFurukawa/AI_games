// Multiplayer Service for real-time game sessions
// This service handles WebSocket connections and real-time game state synchronization

export interface GameSession {
  id: string;
  name: string;
  type: 'story' | 'mystery' | 'rpg' | 'puzzle';
  players: Player[];
  maxPlayers: number;
  isActive: boolean;
  createdAt: Date;
  description: string;
  gameState: any;
  turnOrder: string[];
  currentTurn: string;
  messages: GameMessage[];
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isOnline: boolean;
  joinedAt: Date;
  lastSeen: Date;
}

export interface GameMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  playerId?: string;
  playerName?: string;
  timestamp: Date;
  gameAction?: string;
}

export interface GameAction {
  type: 'join' | 'leave' | 'message' | 'turn_change' | 'game_state_update';
  playerId?: string;
  data: any;
  timestamp: Date;
}

// WebSocket connection management
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  onMessage(callback: (data: any) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Firebase alternative for real-time database
class FirebaseService {
  private isAvailable: boolean = false;

  constructor() {
    // Check if Firebase is available
    this.isAvailable = typeof window !== 'undefined' && 'firebase' in window;
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable) {
      console.warn('Firebase not available, using WebSocket fallback');
      return;
    }

    try {
      // Firebase initialization would go here
      // For now, we'll simulate Firebase availability
      console.log('Firebase service initialized');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      this.isAvailable = false;
    }
  }

  async createGameSession(session: GameSession): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Firebase not available');
    }

    // Simulate Firebase document creation
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Created Firebase session:', sessionId);
    return sessionId;
  }

  async joinGameSession(sessionId: string, player: Player): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Firebase not available');
    }

    // Simulate joining Firebase session
    console.log(`Player ${player.name} joined session ${sessionId}`);
  }

  async updateGameState(sessionId: string, gameState: any): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Firebase not available');
    }

    // Simulate Firebase update
    console.log(`Updated game state for session ${sessionId}`);
  }

  async sendMessage(sessionId: string, message: GameMessage): Promise<void> {
    if (!this.isAvailable) {
      throw new Error('Firebase not available');
    }

    // Simulate Firebase message addition
    console.log(`Sent message to session ${sessionId}:`, message.text);
  }
}

// Main Multiplayer Service
class MultiplayerService {
  private wsService: WebSocketService;
  private firebaseService: FirebaseService;
  private currentSession: GameSession | null = null;
  private currentPlayer: Player | null = null;
  private messageCallbacks: ((message: GameMessage) => void)[] = [];
  private stateCallbacks: ((state: any) => void)[] = [];
  private playerCallbacks: ((players: Player[]) => void)[] = [];

  constructor() {
    // Initialize WebSocket service (you can change this URL to your WebSocket server)
    this.wsService = new WebSocketService('ws://localhost:8080');
    this.firebaseService = new FirebaseService();
    
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      await this.firebaseService.initialize();
      
      // Set up WebSocket message handling
      this.wsService.onMessage((data) => {
        this.handleWebSocketMessage(data);
      });
    } catch (error) {
      console.error('Failed to initialize multiplayer services:', error);
    }
  }

  // Connect to WebSocket server
  async connect(): Promise<void> {
    try {
      await this.wsService.connect();
      console.log('Connected to multiplayer server');
    } catch (error) {
      console.error('Failed to connect to multiplayer server:', error);
    }
  }

  // Create a new game session
  async createGameSession(sessionData: Partial<GameSession>): Promise<GameSession> {
    const session: GameSession = {
      id: `session_${Date.now()}`,
      name: sessionData.name || 'New Game',
      type: sessionData.type || 'story',
      players: [],
      maxPlayers: sessionData.maxPlayers || 6,
      isActive: true,
      createdAt: new Date(),
      description: sessionData.description || 'Join this exciting game!',
      gameState: sessionData.gameState || {},
      turnOrder: [],
      currentTurn: '',
      messages: []
    };

    try {
      // Try Firebase first, fallback to WebSocket
      const sessionId = await this.firebaseService.createGameSession(session);
      session.id = sessionId;
    } catch (error) {
      console.log('Using WebSocket fallback for session creation');
      // Send session creation via WebSocket
      this.wsService.send({
        action: 'create_session',
        session: session
      });
    }

    this.currentSession = session;
    return session;
  }

  // Join an existing game session
  async joinGameSession(sessionId: string, playerName: string): Promise<GameSession> {
    const player: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: playerName,
      isHost: false,
      isOnline: true,
      joinedAt: new Date(),
      lastSeen: new Date()
    };

    this.currentPlayer = player;

    try {
      // Try Firebase first
      await this.firebaseService.joinGameSession(sessionId, player);
    } catch (error) {
      console.log('Using WebSocket fallback for joining session');
      // Send join request via WebSocket
      this.wsService.send({
        action: 'join_session',
        sessionId: sessionId,
        player: player
      });
    }

    return this.currentSession!;
  }

  // Send a message in the current game session
  async sendMessage(text: string, gameAction?: string): Promise<void> {
    if (!this.currentSession || !this.currentPlayer) {
      throw new Error('Not in a game session');
    }

    const message: GameMessage = {
      id: `msg_${Date.now()}`,
      text: text,
      sender: 'user',
      playerId: this.currentPlayer.id,
      playerName: this.currentPlayer.name,
      timestamp: new Date(),
      gameAction: gameAction
    };

    // Add message to local session
    this.currentSession.messages.push(message);

    try {
      // Try Firebase first
      await this.firebaseService.sendMessage(this.currentSession.id, message);
    } catch (error) {
      console.log('Using WebSocket fallback for sending message');
      // Send message via WebSocket
      this.wsService.send({
        action: 'send_message',
        sessionId: this.currentSession.id,
        message: message
      });
    }

    // Notify local callbacks
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Update game state
  async updateGameState(gameState: any): Promise<void> {
    if (!this.currentSession) {
      throw new Error('Not in a game session');
    }

    this.currentSession.gameState = { ...this.currentSession.gameState, ...gameState };

    try {
      // Try Firebase first
      await this.firebaseService.updateGameState(this.currentSession.id, gameState);
    } catch (error) {
      console.log('Using WebSocket fallback for updating game state');
      // Send state update via WebSocket
      this.wsService.send({
        action: 'update_game_state',
        sessionId: this.currentSession.id,
        gameState: gameState
      });
    }

    // Notify local callbacks
    this.stateCallbacks.forEach(callback => callback(gameState));
  }

  // Leave the current game session
  async leaveGameSession(): Promise<void> {
    if (!this.currentSession || !this.currentPlayer) {
      return;
    }

    // Send leave request
    this.wsService.send({
      action: 'leave_session',
      sessionId: this.currentSession.id,
      playerId: this.currentPlayer.id
    });

    // Clear current session
    this.currentSession = null;
    this.currentPlayer = null;
  }

  // Subscribe to message updates
  onMessage(callback: (message: GameMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to game state updates
  onGameStateChange(callback: (state: any) => void): () => void {
    this.stateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.stateCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to player list updates
  onPlayersChange(callback: (players: Player[]) => void): () => void {
    this.playerCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.playerCallbacks.indexOf(callback);
      if (index > -1) {
        this.playerCallbacks.splice(index, 1);
      }
    };
  }

  // Handle WebSocket messages
  private handleWebSocketMessage(data: any): void {
    switch (data.action) {
      case 'message_received':
        this.handleIncomingMessage(data.message);
        break;
      case 'game_state_updated':
        this.handleGameStateUpdate(data.gameState);
        break;
      case 'player_joined':
        this.handlePlayerJoined(data.player);
        break;
      case 'player_left':
        this.handlePlayerLeft(data.playerId);
        break;
      case 'turn_changed':
        this.handleTurnChange(data.newTurn);
        break;
      default:
        console.log('Unknown WebSocket message:', data);
    }
  }

  private handleIncomingMessage(message: GameMessage): void {
    if (this.currentSession) {
      this.currentSession.messages.push(message);
      this.messageCallbacks.forEach(callback => callback(message));
    }
  }

  private handleGameStateUpdate(gameState: any): void {
    if (this.currentSession) {
      this.currentSession.gameState = { ...this.currentSession.gameState, ...gameState };
      this.stateCallbacks.forEach(callback => callback(gameState));
    }
  }

  private handlePlayerJoined(player: Player): void {
    if (this.currentSession) {
      this.currentSession.players.push(player);
      this.playerCallbacks.forEach(callback => callback(this.currentSession!.players));
    }
  }

  private handlePlayerLeft(playerId: string): void {
    if (this.currentSession) {
      this.currentSession.players = this.currentSession.players.filter(p => p.id !== playerId);
      this.playerCallbacks.forEach(callback => callback(this.currentSession!.players));
    }
  }

  private handleTurnChange(newTurn: string): void {
    if (this.currentSession) {
      this.currentSession.currentTurn = newTurn;
      this.stateCallbacks.forEach(callback => callback({ currentTurn: newTurn }));
    }
  }

  // Get current session
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  // Get current player
  getCurrentPlayer(): Player | null {
    return this.currentPlayer;
  }

  // Check if connected
  isConnected(): boolean {
    return this.wsService.isConnected();
  }

  // Disconnect from all services
  disconnect(): void {
    this.wsService.disconnect();
    this.currentSession = null;
    this.currentPlayer = null;
  }
}

// Export singleton instance
export const multiplayerService = new MultiplayerService();

// Export types for use in components
export type { GameSession, Player, GameMessage, GameAction };
