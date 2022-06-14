var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT username FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */


router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

router.get('/lastReceipes', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipes_id = await user_utils.getAllWatches(username);
    let favorite_recipes = {};
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    const results = await user_utils.getRecipesPreview(recipes_id_array.slice(-3));
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});



router.post('/CreateReceipes', async (req,res,next) => {
  var user_id = req.session.user_id;

  try{
    let popularity = "0";
    

    await DButils.execQuery(
      `INSERT INTO cakes_db.recipes VALUES ('${user_id}', '${req.body.title}', '${req.body.InMinutes}',
      '${req.body.image}', '${popularity}', '${req.body.vegan}', '${req.body.vegetarian}', '${recipe_details.glutenFree}',
      '${req.body.Ingredients}', '${req.body.instructions}','${req.body.DishesNumber}'')`
    );
    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }

});


router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_info = await user_utils.MyRecipes(user_id);
    res.status(200).send(recipes_info.data);
  } catch(error){
    next(error); 
  }
});

router.post('/addLike', async (req,res,next) => {
  try{
    let user_id = req.session.user_id;
    await DButils.execQuery(
      `INSERT INTO cakes_db.likes VALUES ('${user_id}', '${req.body.recipe_id}'')`
    );
    await DButils.execQuery(
      `UPDATE cakes_db.recipes
      SET popularity = popularity+1 WHERE id='${req.body.recipe_id}';')`
    );
    res.status(200).send("Like added to the system");
  } catch(error){
    next(error); 
  }
});


router.get('/getMyLikes', async (req,res,next) => {
  try{
    let user_id = req.session.user_id;
    const num_row=await DButils.execQuery(` select count(recipe_id) from like where user_id='${user_id}'`);
    if(num_row==0){
      res.status(200).send("You don't really like anything");
    }
    else{
      let Mylikes = await DButils.execQuery(
        `select distinct recipe_id from like where user_id='${user_id}`
      );

      let info = recipe_utils.getRecipeInformation()
      id_array = [];
      info.map((element) => id_array.push(element.recipe_id));
      const results = await recipe_utils.getRecipesPreview(id_array);
      res.status(200).send(results.data);
    }
    
    
  } catch(error){
    next(error); 
  }
});


module.exports = router;
