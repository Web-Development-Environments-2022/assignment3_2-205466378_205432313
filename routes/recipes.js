var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

var axios = require("axios");

router.get("/", (req, res) => res.send("im here"));




/**
 * This path returns a full details of a recipe by its id
 */

 router.get("/random", async (req, res, next) => {
  var numOfRecipe = 3;
  try {
    const recipe = await recipes_utils.getRandomReceipe(numOfRecipe);
    res.send(recipe.data);
  } catch (error) {
    next(error);
  }
});

router.get("/title/:title/:number", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeByTitle(req.params.title,req.params.number);
    res.send(recipes_utils.getRandomReceipe(5).data);
  } catch (error) {
    next(error);
  }
});

router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    if(req.session.user_id !== "undefined"){
      // var last_watched = await DButils.execQuery(`EXISTS(select username from cakes_db.LastWatched where username=${req.session.username})`);
      if(recipes_utils.IFUserEXIST(req.session.username)){
        DButils.execQuery(`UPDATE cakes_db.LastWatched set recipe_id2=recipe_id1,recipe_id3=recipe_id2, recipe_id1= ${req.params.recipeId} where user_id=${req.session.user_id}`)
      }
      else{
        const zero= 0;
        DButils.execQuery(`INSERT INTO cakes_db.LastWatched (username, recipe_id1, recipe_id2, recipe_id3)
        VALUES (${user_details.username}, ${req.params.recipeId}, ${req.params.recipeId}, ${req.params.recipeId};)`);
      }

    }
    
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



router.get("/random/:randomRecipes", async (req, res, next) => {
  numOfRecipe = req.params.randomRecipes;
  if(numOfRecipe!=5 && numOfRecipe!=10 && numOfRecipe!=15){
    res.status(401).send('error 500: You can only get 5, 10 or 15 random recipes')
  }
  else{
    try {
      const recipe = await recipes_utils.getRandomReceipe(numOfRecipe);
      res.send(recipe.data);
    } catch (error) {
      next(error);
    }
  }
  
});


router.get("/search/:query/:number/:sort/:cuisine", async (req, res, next) => {
  if(req.params.number!=5 && req.params.number!=10 && req.params.number!=15){
    res.status(401).send('error 500: You can only get 5, 10 or 15 random recipes')
  }
  // req.session.setItem('search', req.body);
  try {
    const result = await recipes_utils.search(req.params.query,req.params.number,req.params.sort,req.params.cuisine);
    ids=[]

    for (let i = 0; i < result.data.results.length; i++) {
      ids.push(result.data.results[i].id)
    }
    let details = await recipes_utils.getRecipesPreview(ids);
    res.send(details);
  } catch (error) {
    next(error);
  }
});







module.exports = router;