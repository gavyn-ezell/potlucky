from typing import Literal
from pydantic import BaseModel

class DishPayload(BaseModel):
    attendee: str
    dish: str
    dish_category: Literal["main", "side", "dessert", "drinks", "other"]

class Dish(DishPayload):
    dishId: str


class PotluckPayload(BaseModel):
    name: str
    datetime: str
    timezone: str

    
class PotluckItem(PotluckPayload):
    potluckId: str
    dishes: dict[str, DishPayload] = {}

