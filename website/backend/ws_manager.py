"""WebSocket connection manager — family-room-based broadcasting."""
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # room_id (family_id as str) -> list of connected WebSockets
        self.rooms: dict[str, list[WebSocket]] = {}
        # track which user is in which room
        self.user_rooms: dict[str, str] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        await websocket.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(websocket)
        self.user_rooms[user_id] = room_id

    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        if room_id in self.rooms:
            try:
                self.rooms[room_id].remove(websocket)
            except ValueError:
                pass
        self.user_rooms.pop(user_id, None)

    async def broadcast_to_room(self, room_id: str, message: dict, exclude: WebSocket = None):
        """Send a JSON message to every connection in the room."""
        if room_id not in self.rooms:
            return
        dead = []
        for ws in self.rooms[room_id]:
            if ws is exclude:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            try:
                self.rooms[room_id].remove(ws)
            except ValueError:
                pass

    def online_count(self, room_id: str) -> int:
        return len(self.rooms.get(room_id, []))


# Singleton used by both the WebSocket endpoint and the REST update endpoint
manager = ConnectionManager()
