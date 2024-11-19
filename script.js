let cocktails = [];
let currentCocktail = 0;
let correctAnswers = [];
let skippedQuestions = [];
let totalQuestions = 0;

async function loadCocktails() {
    const response = await fetch('data.json');
    cocktails = await response.json();
}

function startGame(num) {
    totalQuestions = num;
    correctAnswers = [];
    skippedQuestions = [];
    currentCocktail = 0;
    shuffleCocktails();
    document.getElementById('game-setup').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    showQuestion();
}

function shuffleCocktails() {
    cocktails.sort(() => Math.random() - 0.5);
}

function showQuestion() {
    if (currentCocktail < totalQuestions) {
        const cocktail = cocktails[currentCocktail];
        document.getElementById('cocktail-name').textContent = cocktail.name;
    } else {
        endGame();
    }
}

function submitAnswer() {
    const ingredients = document.getElementById('ingredients').value.toLowerCase();
    const volume = parseInt(document.getElementById('volume').value);
    const glass = document.getElementById('glass').value.toLowerCase();
    const cocktail = cocktails[currentCocktail];

    const isCorrect = ingredients === cocktail.ingredients.toLowerCase() &&
                      volume === cocktail.volume &&
                      glass === cocktail.glass.toLowerCase();

    if (isCorrect) {
        correctAnswers.push(cocktail);
    }
    currentCocktail++;
    clearForm();
    showQuestion();
}

function skipQuestion() {
    skippedQuestions.push(cocktails[currentCocktail]);
    currentCocktail++;
    clearForm();
    showQuestion();
}

function clearForm() {
    document.getElementById('ingredients').value = '';
    document.getElementById('volume').value = '';
    document.getElementById('glass').value = '';
}

function endGame() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');

    const score = correctAnswers.length;
    document.getElementById('score').textContent = `Правильных ответов: ${score} из ${totalQuestions}`;

    const errorsList = document.getElementById('errors');
    errorsList.innerHTML = '';
    skippedQuestions.forEach(cocktail => {
        const li = document.createElement('li');
        li.textContent = `${cocktail.name} — ${cocktail.ingredients}, ${cocktail.volume} мл, ${cocktail.glass}`;
        errorsList.appendChild(li);
    });
}

function resetGame() {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('game-setup').classList.remove('hidden');
}

function addIngredientField() {
    const container = document.getElementById('ingredients-container');
    const newField = document.createElement('div');
    newField.classList.add('ingredient-row');
    newField.innerHTML = `
        <input type="text" class="ingredient-input" placeholder="Ингредиент">
        <input type="number" class="ingredient-volume" placeholder="мл">
        <button type="button" onclick="removeIngredientField(this)">Удалить</button>
    `;
    container.appendChild(newField);
}


function clearAllIngredients() {
    const container = document.getElementById('ingredients-container');
    container.innerHTML = `
        <div class="ingredient-row">
            <input type="text" class="ingredient-input" placeholder="Ингредиент">
            <input type="number" class="ingredient-volume" placeholder="мл">
        </div>`;
}

function removeIngredientField(button) {
    const row = button.parentElement;
    row.remove();
}
function getIngredientsList() {
    const rows = document.querySelectorAll('.ingredient-row');
    return Array.from(rows).map(row => {
        const ingredient = row.querySelector('.ingredient-input').value.trim();
        const volume = parseInt(row.querySelector('.ingredient-volume').value.trim());
        return { ingredient, volume };
    }).filter(item => item.ingredient && item.volume);
}
function submitAnswer() {
    const userIngredients = getIngredientsList();
    const glass = document.getElementById('glass').value.toLowerCase();
    const cocktail = cocktails[currentCocktail];

    const isIngredientsCorrect = 
        userIngredients.length === cocktail.ingredients.length &&
        userIngredients.every(({ ingredient, volume }) =>
            cocktail.ingredients.some(
                ({ ingredient: correctIngredient, volume: correctVolume }) =>
                    correctIngredient.toLowerCase() === ingredient.toLowerCase() &&
                    correctVolume === volume
            )
        );

    const isGlassCorrect = glass === cocktail.glass.toLowerCase();

    if (isIngredientsCorrect && isGlassCorrect) {
        correctAnswers.push(cocktail);
    }
    currentCocktail++;
    clearForm();
    showQuestion();
}

function clearForm() {
    clearAllIngredients();
    document.getElementById('glass').value = '';
}

loadCocktails();
