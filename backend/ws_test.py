import asyncio
import websockets
import json
import jwt

async def test():
    # Make a dummy token
    token = jwt.encode({"sub": "dba54212-2b6c-4785-a42e-7543a45bf8d2", "username": "test_user"}, "c881dc3efc60e4cade2b494267f22a8da2eab50e4466f3cdc24d129df13dca11", algorithm="HS256")
    uri = f"ws://localhost:8000/api/ws/private/9c8599a8-3230-4f55-a526-40ad83d94451?token={token}"
    try:
        async with websockets.connect(uri) as ws:
            print("Connected!")
            await ws.send(json.dumps({
                "event": "send_message",
                "data": {"content": "Hello private chat", "message_type": "text"}
            }))
            print("Sent message, waiting for response...")
            while True:
                try:
                    res = await asyncio.wait_for(ws.recv(), timeout=3.0)
                    print("Received:", res)
                except asyncio.TimeoutError:
                    print("Timeout waiting for more messages")
                    break
    except Exception as e:
        print("Exception:", e)

asyncio.run(test())
