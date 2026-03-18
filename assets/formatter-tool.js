(function () {
  const toolKey = 'formatter';
  const saveButton = document.getElementById('saveRecipeButton');
  const recipeSelect = document.getElementById('recipeSelect');
  const applyButton = document.getElementById('applyRecipeButton');
  const deleteButton = document.getElementById('deleteRecipeButton');
  const directionButtons = document.querySelectorAll('[data-direction]');
  const presetButtons = document.querySelectorAll('[data-preset]');
  const delimiter = document.getElementById('delimiter');
  const quoteChar = document.getElementById('quoteChar');
  const wrapStart = document.getElementById('wrapStart');
  const wrapEnd = document.getElementById('wrapEnd');
  const trimLines = document.getElementById('trimLines');
  const skipEmpty = document.getElementById('skipEmpty');

  if (!saveButton || !recipeSelect || !applyButton || !deleteButton || !delimiter || !quoteChar || !wrapStart || !wrapEnd || !trimLines || !skipEmpty) {
    return;
  }

  function readRecipes() {
    return DevFormat.loadRecipes(toolKey);
  }

  function writeRecipes(recipes) {
    DevFormat.saveRecipes(toolKey, recipes);
  }

  function getCurrentSettings() {
    const activeDirection = document.querySelector('[data-direction].active');
    const activePreset = document.querySelector('[data-preset].active');

    return {
      reversed: activeDirection ? activeDirection.dataset.direction === 'reverse' : false,
      preset: activePreset ? activePreset.dataset.preset : 'custom',
      delimiter: delimiter.value,
      quote: quoteChar.value,
      wrapStart: wrapStart.value,
      wrapEnd: wrapEnd.value,
      trim: trimLines.checked,
      skip: skipEmpty.checked
    };
  }

  function populateRecipes(selectedId) {
    const recipes = readRecipes();
    recipeSelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = recipes.length ? 'Choose a saved recipe' : 'No saved recipes yet';
    recipeSelect.appendChild(placeholder);

    recipes.forEach(function (recipe) {
      const option = document.createElement('option');
      option.value = recipe.id;
      option.textContent = recipe.name;
      recipeSelect.appendChild(option);
    });

    if (selectedId) {
      recipeSelect.value = selectedId;
    }
  }

  function dispatchSettingChange(field, type) {
    field.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function applyRecipe(recipe) {
    const direction = recipe.reversed ? 'reverse' : 'forward';
    const directionButton = document.querySelector('[data-direction="' + direction + '"]');
    if (directionButton && !directionButton.classList.contains('active')) {
      directionButton.click();
    }

    const preset = recipe.preset || 'custom';
    const presetButton = document.querySelector('[data-preset="' + preset + '"]') || document.querySelector('[data-preset="custom"]');
    if (presetButton) {
      presetButton.click();
    }

    delimiter.value = recipe.delimiter || '';
    quoteChar.value = recipe.quote || '';
    wrapStart.value = recipe.wrapStart || '';
    wrapEnd.value = recipe.wrapEnd || '';
    trimLines.checked = recipe.trim !== false;
    skipEmpty.checked = recipe.skip !== false;

    [delimiter, quoteChar, wrapStart, wrapEnd].forEach(function (field) {
      dispatchSettingChange(field, 'input');
    });
    [trimLines, skipEmpty].forEach(function (field) {
      dispatchSettingChange(field, 'change');
    });
  }

  saveButton.addEventListener('click', function () {
    const name = window.prompt('Name this recipe', '');
    if (!name) return;

    const trimmedName = name.trim();
    if (!trimmedName) return;

    const recipes = readRecipes();
    const existing = recipes.find(function (recipe) {
      return recipe.name.toLowerCase() === trimmedName.toLowerCase();
    });
    const settings = getCurrentSettings();

    if (existing) {
      Object.assign(existing, settings, { name: trimmedName, updatedAt: Date.now() });
      writeRecipes(recipes);
      populateRecipes(existing.id);
    } else {
      const next = Object.assign({
        id: 'recipe_' + Date.now(),
        name: trimmedName,
        updatedAt: Date.now()
      }, settings);
      recipes.unshift(next);
      writeRecipes(recipes);
      populateRecipes(next.id);
    }

    DevFormat.showToast('Recipe saved.');
    DevFormat.trackEvent('recipe_save', {
      tool: toolKey,
      preset: settings.preset
    });
  });

  applyButton.addEventListener('click', function () {
    const selectedId = recipeSelect.value;
    if (!selectedId) return;

    const recipe = readRecipes().find(function (item) {
      return item.id === selectedId;
    });
    if (!recipe) return;

    applyRecipe(recipe);
    DevFormat.showToast('Recipe applied.');
    DevFormat.trackEvent('recipe_apply', {
      tool: toolKey,
      preset: recipe.preset || 'custom'
    });
  });

  deleteButton.addEventListener('click', function () {
    const selectedId = recipeSelect.value;
    if (!selectedId) return;

    const recipes = readRecipes();
    const recipe = recipes.find(function (item) {
      return item.id === selectedId;
    });
    if (!recipe) return;

    if (!window.confirm('Delete this recipe?')) return;

    const nextRecipes = recipes.filter(function (item) {
      return item.id !== selectedId;
    });
    writeRecipes(nextRecipes);
    populateRecipes();
    DevFormat.showToast('Recipe deleted.');
    DevFormat.trackEvent('recipe_delete', {
      tool: toolKey,
      preset: recipe.preset || 'custom'
    });
  });

  populateRecipes();
})();
