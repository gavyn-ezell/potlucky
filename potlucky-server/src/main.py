import uuid
from fastapi import FastAPI, HTTPException
from botocore.exceptions import ClientError

from src.models.potluck import PotluckPayload, PotluckItem, DishPayload, Dish
from src.dynamodb.client import dynamodb_client

app = FastAPI()

@app.post("/potluck")
def create_potluck(payload: PotluckPayload):
    try:
        dynamodb_client.create_potluck(PotluckItem(
            potluckId=str(uuid.uuid4()),
            **payload.model_dump()
        ))
    except ClientError as e:
        raise HTTPException(status_code=500, detail="Something went wrong")

    return {"message": "Potluck created."}

@app.get("/potluck/{potluckId}")
def get_potluck(potluckId: str):
    item = dynamodb_client.get_potluck(potluckId)
    if not item:
        raise HTTPException(status_code=404, detail="Potluck not found")
    return item

@app.post("/potluck/{potluckId}/dish")
def add_dish(potluckId: str, payload: DishPayload):
    try:
        dynamodb_client.add_dish_to_potluck(potluckId, Dish(
            dishId=str(uuid.uuid4()),
            **payload.model_dump()
        ))
    except ClientError as e:
        print(f"AWS Error: {e}")
        raise HTTPException(status_code=500, detail="Database failure")

    return {"message": "Dish added to potluck."}

@app.delete("/potluck/{potluckId}/dish/{dishId}")
def remove_dish(potluckId: str, dishId: str):
    try:
        # The client method handles the find-and-remove logic
        dynamodb_client.remove_dish_from_potluck(potluckId, dishId)
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Could not remove dish")
    
    return {"message": "Dish removed from potluck."}
