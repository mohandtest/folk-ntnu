//Array for flashcards
export let flashcards = [];  // Array for flashcard data objects
export let currentFlashcardIndex = 0;
//Knapp for å legge til kort
let addFlashcardButton = document.querySelector('#addFlashcardButton');
let flashcardsDiv = document.querySelector("#flashcardContainer")
let next = document.querySelector("#nextButton")
let prev = document.querySelector("#prevButton")
let del = document.querySelector("#deleteButton")

export function createFlashcard(question, answer) {
    const flashcardElement = document.createElement('div');
    flashcardElement.className = 'flashcard';
    
    const front = document.createElement('div');
    front.className = 'front';
    front.textContent = question;
    
    const back = document.createElement('div');
    back.className = 'back';
    back.textContent = answer;
    
    flashcardElement.appendChild(front);
    flashcardElement.appendChild(back);
    
    flashcardElement.addEventListener('click', () => {
        flashcardElement.classList.toggle('flipped');
    });
    
    return { element: flashcardElement, object: { question, answer } };
}

function removeCurrentFlashcard(){
    const flashcard = document.querySelector(".flashcard");
    if (flashcard){
        flashcard.remove();
    }
}

export function showCurrentFlashcard() {
    const container = document.getElementById('flashcardContainer');
    container.innerHTML = ''; // clear previous display
    console.log("flashcards length:", flashcards.length, "currentFlashcardIndex:", currentFlashcardIndex);
    
    if (!flashcards.length) {
        container.innerHTML = '<div class="flashcard"><div class="front">No flashcards available</div><div class="back"></div></div>';
        return;
    }
    
    if (currentFlashcardIndex < 0 || currentFlashcardIndex >= flashcards.length) {
        console.warn("currentFlashcardIndex out of bounds; resetting to 0");
        currentFlashcardIndex = 0;
    }
    
    const currentFlashcard = flashcards[currentFlashcardIndex];
    if (!currentFlashcard) {
        console.error('No flashcard defined at index', currentFlashcardIndex);
        return;
    }
    // Use the createFlashcard function to get the element and append its element.
    const cardData = createFlashcard(currentFlashcard.question, currentFlashcard.answer);
    container.appendChild(cardData.element);
}

export function nextFlashcard(test){
    if (flashcards.length === 0) return;
    if (!test){
        currentFlashcardIndex++;
        if (currentFlashcardIndex >= flashcards.length) {
            currentFlashcardIndex = 0;
        }
    } else {
        currentFlashcardIndex = flashcards.length - 1;
    }
    removeCurrentFlashcard();
    showCurrentFlashcard();
}

function prevFlashcard(){
    if (flashcards.length === 0) return;
    currentFlashcardIndex--;
    if (currentFlashcardIndex < 0) {
        currentFlashcardIndex = flashcards.length - 1;
    }
    removeCurrentFlashcard();
    showCurrentFlashcard();
}

function deleteCurrentFlashcard(index) {
    flashcards.splice(index, 1);
    if (index === currentFlashcardIndex && index === flashcards.length) {
        currentFlashcardIndex--;
    }
}

// Event listeners:

addFlashcardButton.addEventListener('click', () => {
    const question = document.querySelector('#question').value;
    const answer = document.querySelector('#answer').value;
    // Check for duplicates based on question.
    let check = flashcards.find(flashcard => flashcard.question === question);
    if (check){
        alert("Dette kortet finnes allerede. Vennligst bruk et annet spørsmål eller slett kortet");
        return;
    }
    if (question !== '' && answer !== '') {
        let newCard = createFlashcard(question, answer);
        flashcards.push(newCard.object);
        window.saveFlashcards(flashcards);
        console.log("New flashcards array:", flashcards);
        nextFlashcard(true);
    } else {
        alert("Vennligst fyll skjemaet.");
    }
});

next.addEventListener('click', () => {
    if (flashcards.length > 0){
        nextFlashcard();
    }
});

prev.addEventListener('click', () => {
    if (flashcards.length > 0){
        prevFlashcard();
    }
});

del.addEventListener('click', () => {
    if (flashcards.length > 0){
        const question = flashcards[currentFlashcardIndex].question;
        const answer = flashcards[currentFlashcardIndex].answer;
        window.deleteFlashcard(question, answer);
        deleteCurrentFlashcard(currentFlashcardIndex);
        removeCurrentFlashcard();
        if (flashcards.length !== 0){
            nextFlashcard();
        } else {
            flashcardsDiv.innerHTML = `
            <div class="flashcard">
                <div class="front">Legg inn ditt første flashcard i feltet til venstre!</div>
                <div class="back"></div>
            </div>`;
        }
    }
});