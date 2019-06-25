import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.ingredients = res.data.recipe.ingredients;
            this.img = res.data.recipe.image_url;
            this.author = res.data.recipe.publisher;
            this.source = res.data.recipe.source_url;

        }
        catch (error) {
            console.log(error);
        }
    }

    calcCookingTime() {

        // Assuming every 3 ingredient take 15 mins to cook.
        const ingredients = Math.ceil(this.ingredients.length / 3);
        this.cookingTime = ingredients * 15;

    }

    calcServing() {
        this.serving = 4;
    }

    updateServing(type) {
        // Servings
        const newServing = type === 'dec' ? this.serving - 1 : this.serving + 1

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServing / this.serving);
        });

        this.serving = newServing;
    }

    parseIngredient() {

        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'cups', 'pounds', 'teaspoons', 'teaspoon']
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'cup', 'pound', 'tsp', 'tsp']

        // Map method will loop and implement the function to array then return new array.
        const newIngredient = this.ingredients.map(el => {

            // Unifrom units
            let ingredient = el.toLowerCase();

            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShort[i]);
            });

            // Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

            // Parse ingredients tnto count, unit and ingredient
            const arrIng = ingredient.split(' ');

            // unitShort.includes(el2) --> el2 is includes in unitShort or not?
            // findIndex will loop performing test over the array then return the index.
            const unitIndex = arrIng.findIndex(el2 => unitShort.includes(el2));

            let objIng;

            if (unitIndex > -1) {

                // There is a unit.

                // Ex. 4 1/2 cups --> arrCount is [4, 1/2]
                // Ex. 4 cups --> arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (parseInt(arrIng[0], 10)) {

                // There is no unit, but 1st element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            } else if (unitIndex === -1) {

                // There is no unit and no number in 1st pos.
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        });

        this.ingredients = newIngredient;
    }

}

