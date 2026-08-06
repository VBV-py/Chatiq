import asyncio
import websockets
import json

async def test():
    uri = f"ws://localhost:8000/api/ws/private/9c8599a8-3230-4f55-a526-40ad83d94451?token=invalid_token"
    try:
        async with websockets.connect(uri) as ws:
            print("Connected!")
    except Exception as e:
        print("Exception:", e)

asyncio.run(test())
