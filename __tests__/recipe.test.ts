import { Recipe } from "../recipe/recipe";

test("Changing name of Recipe", () => {
    let recipe = new Recipe();

    recipe.setName("Pie");

    expect(recipe.name).toBe("Pie")
});

test("Setting name of Recipe to nothing.", () => {
    let recipe = new Recipe();

    recipe.setName("Pie");
    recipe.setName("");
    
    expect(recipe.name).toBe("Pie");
})