import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from botocore.exceptions import ClientError

from src.models.potluck import PotluckPayload, PotluckItem, DishPayload, Dish
from src.dynamodb.client import dynamodb_client

THIRTY_DAYS_IN_SECONDS = 2592000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/potluck")
def create_potluck(payload: PotluckPayload):
    potluckId = str(uuid.uuid4())
    potluck_datetime = datetime.fromisoformat(payload.datetime.replace('Z', '+00:00'))
    expire_at = int(potluck_datetime.timestamp()) + THIRTY_DAYS_IN_SECONDS
    
    try:
        dynamodb_client.create_potluck(PotluckItem(
            potluckId=potluckId,
            **payload.model_dump(),
            expire_at=expire_at
        ))
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Something went wrong")

    return {
        "message": "Potluck created.",
        "potluckId": potluckId
    }

@app.get("/potluck/{potluckId}")
def get_potluck(potluckId: str):
    item = dynamodb_client.get_potluck(potluckId)
    if not item:
        raise HTTPException(status_code=404, detail="Potluck not found")
    return item

@app.post("/potluck/{potluckId}/dish")
def add_dish(potluckId: str, payload: DishPayload):
    dishId = str(uuid.uuid4())
    try:
        dynamodb_client.add_dish_to_potluck(potluckId, Dish(
            dishId=dishId,
            **payload.model_dump()
        ))
    except ClientError as e:
        print(f"AWS Error: {e}")
        raise HTTPException(status_code=500, detail="Database failure")

    return {
        "message": "Dish added to potluck.",
        "dishId": dishId
    }

@app.delete("/potluck/{potluckId}/dish/{dishId}")
def remove_dish(potluckId: str, dishId: str):
    try:
        # The client method handles the find-and-remove logic
        dynamodb_client.remove_dish_from_potluck(potluckId, dishId)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Could not remove dish")
    
    return {"message": "Dish removed from potluck."}
