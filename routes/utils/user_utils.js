const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getAllWatches(username){
    const recipes_ids = await DButils.execQuery(`select DISTINCT recipe_id from WatchedByUser where username='${username}'`);
    return recipes_ids;
}


async function MyRecipes(user_id){
    const num_row = await DButils.execQuery(` select count(id) from recipes where user_id='${user_id}'`);
    if(num_row>0){
        const recipes_info = await DButils.execQuery(`select * from recipes where user_id='${user_id}'`);
        return recipes_id;
    }
    return null;
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getAllWatches = getAllWatches;
exports.MyRecipes = MyRecipes;