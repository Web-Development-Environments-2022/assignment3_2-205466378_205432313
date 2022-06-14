const axios = require("axios");
const res = require("express/lib/response");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    let res = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return res;
}

async function getRandomReceipe(numOfRecipe){
    
    console.log(numOfRecipe);
    const ans = await axios.get(`${api_domain}/random`, {
    params: {
        Number: numOfRecipe,
        apiKey: process.env.spooncular_apiKey
    }
    });

    return ans;
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

const api_title ="https://api.spoonacular.com/recipes/complexSearch?query=";
// async function getRecipeByTitle(title, numTitles){
//     var receipes = await axios.get(`${api_title}/${title}&number=${numTitles}`, {
//         params: {
//             includeNutrition: false,
//             apiKey: process.env.my_apiKey
//         }
//     });
//     console.log(receipes);
//     var res = new Array(numTitles);
//     for (let i = 0; i < receipes.data.results.length; i++) {
//         res[i] = receipes.data.results[i+1].id;
//         res[i] = await getRecipeDetails(res[i]);
//     }
//     return res;

// }

async function getRecipeByTitle(title,numTitles){
    let promises = [];
    var last_watched_list = await DButils.execQuery(`select id from cakes_db.recips where  title=${title} `);
    last_watched_list.map((id)=>{
        promises.push(getRecipeInformation(id));
    });
    let info_res=await Promise.all(info_res);

}

async function IFUserEXIST(username) {
    var last_watched = await DButils.execQuery(`select username from cakes_db.LastWatched `);

    for (let i = 0; i < last_watched.length; i++){
        if (last_watched[i]===username)
            return true;
    }
    return false;
}

async function search(query,number,sort,cuisine) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: query,
            number: number,
            sort: sort,
            cuisine: cuisine,
            apiKey: process.env.spooncular_apiKey
        }
        
    });
    return response
}

function extractPreviewRecipeDetails(recipes_info) {
    return recipes_info.map((recipe_info) => {
        //check the data type so it can work with diffrent types of data
        let data = recipe_info;
        if (recipe_info.data) {
            data = recipe_info.data;
        }
        const {
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
        } = data;
        return {
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree
        }
    })
  }



async function getRecipesPreview(recipes_ids_list) {
    let promises = [];
    recipes_ids_list.map((id) => {
        promises.push(getRecipeInformation(id));
    });
    let info_res = await Promise.all(promises);
    info_res.map((recp)=>{console.log(recp.data)});
    // console.log(info_res);
    return extractPreviewRecipeDetails(info_res);
  }


exports.getRecipeDetails = getRecipeDetails;
exports.getRandomReceipe = getRandomReceipe;
exports.getRecipeByTitle = getRecipeByTitle;
exports.IFUserEXIST = IFUserEXIST;
exports.search = search;
exports.getRecipesPreview =getRecipesPreview;
exports.getRecipeInformation = getRecipeInformation;