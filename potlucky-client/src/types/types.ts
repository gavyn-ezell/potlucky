
export interface PotluckFormEntry {
  name: string;
  datetime: Date | null;
  information: string | undefined;
  requirements: Partial<Record<Category, number>>;
}

export interface PotluckDataResponse {
  datetime: string;
  name: string;
  information: string;
  dishes: DishResponse;
  requirements: Partial<Record<Category, number>>;
}

export interface DishResponse {
  [dish_id: string]: Dish;
}

export interface Dish {
  attendee: string;
  dish: string;
  dish_category: Category;
}

export enum Category {
  Main = "main",
  Side = "side",
  Dessert = "dessert",
  Drinks = "drinks",
  Other = "other",
}

export interface PotluckProgress {
  numRequired: number, 
  numCompleted: number
}

