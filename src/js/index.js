import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';

const state = {};

const controlSearch = async () => {

    // Get query from the view
    const query = searchView.getInput();

    if (query) {

        // New search object and add to state
        state.search = new Search(query);

        // Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);


        try {

            // Search for recipes
            await state.search.getResults();
            clearLoader();

            // Render results on UI
            searchView.renderResults(state.search.result);

        }
        catch (error) {
            console.log(error);
        }



    }
};

document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

const controlRecipe = async () => {

    // Get id from URL
    const id = window.location.hash.replace('#', '');

    if (id) {

        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {

            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredient();

            // Calculate servings and time
            state.recipe.calcCookingTime();
            state.recipe.calcServing();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch (error) {
            console.log(error);
        }
    }
}

// hashchange listens the event when hash in url changes.
// load is the event when page is loaded.
['hashchange', 'load'].forEach(event => addEventListener(event, controlRecipe));

// List Controller
const controlList = () => {
    // Create new list if there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);

        listView.renderItem(item);
    });
}

elements.shopping.addEventListener('click', e => {
    // Get id from dataset when click on anything close to shopping__item
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from UI
        listView.deleteItem(id);

        // Delete from state
        state.list.deleteItem(id);
    
    // Handle update count event
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);

        state.list.updateCount(id, val);
    }


});

// Restore liked recipe when page loads
window.addEventListener('load', () => {
    state.likes = new Likes(); // Create new Likes object
    state.likes.readStorage(); // Restore likes
    likesView.toggleLikeItem(state.likes.getNumLikes());
    state.likes.likes.forEach(el => likesView.renderLike(el)); // Render like list to UI
})

// LIKE controller
const controlLike = () => {

    if (!state.likes) state.likes = new Likes();

    const currentId = state.recipe.id;

    // if user has not liked this recipe yet
    if (!state.likes.isLiked(currentId)) {
        // Add like to state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button
        likesView.toggleLikeBtn(state.likes.isLiked);

        // Add like to UI list
        likesView.renderLike(newLike);
    } 
    
    // if user has liked 
    else {
        // Remove the like from state
        state.likes.deleteLike(currentId);

        // Toggle like button
        likesView.toggleLikeBtn(false);

        // Remove like from the list
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeItem(state.likes.getNumLikes());

}

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.serving > 1) {
            state.recipe.updateServing('dec');
            recipeView.updateServing(state.recipe);
        }

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServing('inc');
        recipeView.updateServing(state.recipe);

    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();

    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();

    }
});
