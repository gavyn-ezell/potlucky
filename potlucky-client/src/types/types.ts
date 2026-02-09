// Represents the potluck JSON 'data' response
export interface PotluckDataResponse {
    datetime: string;
    name: string;
    information: string;
    dishes: DishResponse;
};

export interface DishResponse {
    [dish_id: string]: Dish
};

export interface Dish {
    attendee: string; 
    dish: string;
    dish_category: Category;
};

export enum Category {
  Main = 'main',
  Side = 'side',
  Dessert = 'dessert',
  Drinks = 'drinks',
  Other = 'other',
};

