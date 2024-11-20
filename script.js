let cocktails = [];
let currentCocktail = 0;
let correctAnswers = [];
let skippedQuestions = [];
let totalQuestions = 0;
let incorrectAnswers = [];


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
    const userIngredients = getIngredientsList();
    const glass = document.getElementById('glass').value.toLowerCase();
    const cocktail = cocktails[currentCocktail];

    const errors = {
        ingredients: false,
        glass: false
    };

    const isIngredientsCorrect = userIngredients.every(({ ingredient, volume }) => {
        const correctIngredient = cocktail.ingredients.find(
            ({ ingredient: correctIng }) => correctIng.toLowerCase() === ingredient.toLowerCase()
        );

        if (!correctIngredient) return false;

        if (typeof correctIngredient.volume === 'string') {
            return true; 
        }
        return correctIngredient.volume === volume;
    });

    if (!isIngredientsCorrect) {
        errors.ingredients = true;
    }

    const isGlassCorrect = glass === cocktail.glass.toLowerCase();
    if (!isGlassCorrect) {
        errors.glass = true;
    }

    if (isIngredientsCorrect && isGlassCorrect) {
        correctAnswers.push(cocktail);
    } else {
        incorrectAnswers.push({ cocktail, userAnswer: { ingredients: userIngredients, glass }, errors });
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

    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = `
        <tr>
            <th>Коктейль</th>
            <th>Ваш ответ</th>
            <th>Ошибки</th>
        </tr>
    `;

    incorrectAnswers.forEach(({ cocktail, userAnswer, errors }) => {
        const row = document.createElement('tr');

        const cocktailCell = document.createElement('td');
        cocktailCell.textContent = cocktail.name;
        row.appendChild(cocktailCell);

        const userAnswerCell = document.createElement('td');
        const userIngredients = userAnswer.ingredients
            .map(({ ingredient, volume }) => `${ingredient} (${volume} мл)`)
            .join(', ');
        userAnswerCell.textContent = `Ингредиенты: ${userIngredients}, Стекло: ${userAnswer.glass}`;
        row.appendChild(userAnswerCell);

        const errorsCell = document.createElement('td');
        let errorText = '';
        if (errors.ingredients) {
            errorText += 'Ингредиенты не совпадают. ';
        }
        if (errors.glass) {
            errorText += 'Неверный бокал.';
        }
        errorsCell.textContent = errorText;
        row.appendChild(errorsCell);

        resultsTable.appendChild(row);
    });
}

function formatIngredients(ingredients) {
    return ingredients
        .map(({ ingredient, volume }) => `${ingredient} (${volume} мл)`)
        .join(', ');
}



function resetGame() {
    correctAnswers = [];
    incorrectAnswers = [];
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
    }).filter(item => item.ingredient && !isNaN(item.volume));
}

function submitAnswer() {
    const userIngredients = getIngredientsList();
    const glass = document.getElementById('glass').value.toLowerCase();
    const cocktail = cocktails[currentCocktail];

    const errors = {
        ingredients: false,
        glass: false
    };

    // Проверка ингредиентов
    const isIngredientsCorrect = userIngredients.every(({ ingredient, volume }) => {
        const correctIngredient = cocktail.ingredients.find(
            ({ ingredient: correctIng }) => correctIng.toLowerCase() === ingredient.toLowerCase()
        );

        if (!correctIngredient) return false;

        if (typeof correctIngredient.volume === 'string') {
            // Проверяем текстовые объемы
            if (correctIngredient.volume.toLowerCase() === 'топом') {
                return true; // Засчитываем, если название совпадает
            }

            if (correctIngredient.volume.toLowerCase() === 'по вкусу') {
                return true; // То же самое для "по вкусу"
            }

            if (correctIngredient.volume.toLowerCase() === 'дэш') {
                return true; // И для "дэш"
            }
        }

        // Проверка числовых объемов
        return correctIngredient.volume === volume;
    });

    if (!isIngredientsCorrect) {
        errors.ingredients = true;
    }

    // Проверка бокала
    const isGlassCorrect = glass === cocktail.glass.toLowerCase();
    if (!isGlassCorrect) {
        errors.glass = true;
    }

    if (isIngredientsCorrect && isGlassCorrect) {
        correctAnswers.push(cocktail);
    } else {
        incorrectAnswers.push({ cocktail, userAnswer: { ingredients: userIngredients, glass }, errors });
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
