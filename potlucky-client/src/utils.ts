import { Category } from "./types/types";


/**
 * Returns the corresponding emoji for a given category.
 *
 * @param category - The category for which to retrieve the emoji.
 * @returns A string representing the emoji associated with the specified category.
 *
 * Categories and their corresponding emojis:
 * - `Category.Main`: 🍖
 * - `Category.Dessert`: 🍰
 * - `Category.Drinks`: 🥤
 * - `Category.Other`: 🍽️
 * - `Category.Side`: 🍚
 */
export function getCategoryEmoji(category: Category) {
    switch(category) {
        case Category.Main:
            return "🍖"
        case Category.Dessert:
            return "🍰"
        case Category.Drinks:
            return "🥤"
        case Category.Other:
            return "🍽️"
        case Category.Side:
            return "🍚 "
    }
}