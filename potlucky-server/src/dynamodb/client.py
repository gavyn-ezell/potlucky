import boto3
from src.config import settings
from src.models.potluck import PotluckItem, Dish

class DynamoDBClient:
    def __init__(self):
        self.dynamodb = boto3.resource(
            "dynamodb",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key,
            aws_secret_access_key=settings.aws_secret_key,
        )
        self.table = self.dynamodb.Table(settings.dynamo_table_name)

    def get_potluck(self, potluck_id: str):
        response = self.table.get_item(Key={'potluckId': potluck_id})
        return response.get('Item')
    
    def create_potluck(self, item: PotluckItem):
        return self.table.put_item(
            Item=item.model_dump(), 
            ConditionExpression="attribute_not_exists(potluckId)"
        )

    def add_dish_to_potluck(self, potluck_id: str, dish: Dish):
        return self.table.update_item(
            Key={'potluckId': potluck_id},
            UpdateExpression="SET dishes.#dishId = :new_dish",
            ConditionExpression="attribute_exists(potluckId)",
            ExpressionAttributeNames={
                "#dishId": dish.dishId
            },
            ExpressionAttributeValues={
                ':new_dish': dish.model_dump(exclude={'dishId'})
            },
            ReturnValues="UPDATED_NEW"
        )

    def remove_dish_from_potluck(self, potluck_id: str, dish_id: str):
        """
        Removes a single dish from the dishes map by its dishId.
        """
        return self.table.update_item(
            Key={'potluckId': potluck_id},
            UpdateExpression="REMOVE dishes.#dishId",
            ExpressionAttributeNames={
                "#dishId": dish_id
            },
            ReturnValues="UPDATED_NEW"
        )

# Singleton instance
dynamodb_client = DynamoDBClient()