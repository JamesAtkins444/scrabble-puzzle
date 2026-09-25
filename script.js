const BOARD_SIZE = 15;

const boardElement = document.getElementById("board");
const generateButton = document.getElementById("generateButton");
const wordCountElement = document.getElementById("wordCount");
const wordListElement = document.getElementById("wordList");

let board = [];
let placedWords = [];


/* --------------------------------
   CREATE EMPTY BOARD
-------------------------------- */

function createEmptyBoard() {

    board = [];

    for (let row = 0; row < BOARD_SIZE; row++) {

        board[row] = [];

        for (let col = 0; col < BOARD_SIZE; col++) {

            board[row][col] = null;

        }
    }
}


/* --------------------------------
   DISPLAY BOARD
-------------------------------- */

function displayBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < BOARD_SIZE; row++) {

        for (let col = 0; col < BOARD_SIZE; col++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            const letter = board[row][col];

            if (letter) {

                cell.textContent = letter;

                cell.classList.add("letter");

            }

            boardElement.appendChild(cell);

        }
    }
}


/* --------------------------------
   CHECK IF WORD CAN BE PLACED
-------------------------------- */

function canPlaceWord(word, row, col, direction) {

    const letters = word.toUpperCase();

    let touchesExistingWord = false;

    for (let i = 0; i < letters.length; i++) {

        const currentRow =
            direction === "horizontal"
                ? row
                : row + i;

        const currentCol =
            direction === "horizontal"
                ? col + i
                : col;


        /* Word must remain on board */

        if (
            currentRow < 0 ||
            currentRow >= BOARD_SIZE ||
            currentCol < 0 ||
            currentCol >= BOARD_SIZE
        ) {
            return false;
        }


        const existingLetter =
            board[currentRow][currentCol];


        /* Existing letter must match */

        if (
            existingLetter &&
            existingLetter !== letters[i]
        ) {
            return false;
        }


        /* Remember that this word touches the board */

        if (existingLetter) {

            touchesExistingWord = true;

        }
    }


    /*
       The first word is allowed to be placed
       without touching anything.

       Every word afterwards must touch
       an existing word.
    */

    if (placedWords.length > 0 && !touchesExistingWord) {

        return false;

    }


    return true;
}


/* --------------------------------
   PLACE WORD
-------------------------------- */

function placeWord(word, row, col, direction) {

    const letters = word.toUpperCase();

    for (let i = 0; i < letters.length; i++) {

        const currentRow =
            direction === "horizontal"
                ? row
                : row + i;

        const currentCol =
            direction === "horizontal"
                ? col + i
                : col;

        board[currentRow][currentCol] = letters[i];

    }


    placedWords.push({

        word: letters,

        row: row,

        col: col,

        direction: direction

    });

}


/* --------------------------------
   GET WORDS FROM DICTIONARY
-------------------------------- */

let dictionary = [];


/* --------------------------------
   LOAD SCRABBLE DICTIONARY
-------------------------------- */

async function loadDictionary() {

    try {

        const response =
            await fetch("dictionary.txt");

        const text =
            await response.text();


        dictionary =
            text
                .split(/\r?\n/)
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length > 1);


        console.log(
            `Loaded ${dictionary.length} words`
        );


        generateBoard();


    } catch (error) {

        console.error(
            "Could not load dictionary:",
            error
        );

    }

}


/* --------------------------------
   RANDOM WORD
-------------------------------- */

function getRandomWord() {

    const index =
        Math.floor(
            Math.random() * dictionary.length
        );

    return dictionary[index];

}


/* --------------------------------
   TRY TO ADD A WORD
-------------------------------- */

function tryAddWord() {

    for (let attempt = 0; attempt < 100; attempt++) {

        const word = getRandomWord();

        const direction =
            Math.random() < 0.5
                ? "horizontal"
                : "vertical";


        /*
           Pick a random location.
        */

        const row =
            Math.floor(
                Math.random() * BOARD_SIZE
            );

        const col =
            Math.floor(
                Math.random() * BOARD_SIZE
            );


        if (
            canPlaceWord(
                word,
                row,
                col,
                direction
            )
        ) {

            placeWord(
                word,
                row,
                col,
                direction
            );

            return true;

        }

    }

    return false;

}


/* --------------------------------
   GENERATE BOARD
-------------------------------- */

function generateBoard() {

    createEmptyBoard();

    placedWords = [];


    /*
       FIRST WORD

       The first word MUST cross
       the centre tile.

       On a 15x15 board the centre
       is row 7, column 7.
    */

    const firstWord = "SCRABBLE";

    const centreRow = 7;
    const centreCol = 7;


    /*
       Put the first word horizontally.

       SCRABBLE has 8 letters.

       We position it so that the
       centre tile contains one of
       its letters.
    */

    const firstWordStartCol =
        centreCol - 3;


    placeWord(
        firstWord,
        centreRow,
        firstWordStartCol,
        "horizontal"
    );


    /*
       Add additional words.
    */

    let failedAttempts = 0;

    while (
        placedWords.length < 25 &&
        failedAttempts < 500
    ) {

        const added = tryAddWord();

        if (added) {

            failedAttempts = 0;

        } else {

            failedAttempts++;

        }

    }


    displayBoard();

    displayWords();

}


/* --------------------------------
   DISPLAY WORD LIST
-------------------------------- */

function displayWords() {

    wordCountElement.textContent =
        `${placedWords.length} words`;


    wordListElement.innerHTML = "";


    placedWords.forEach(wordData => {

        const element =
            document.createElement("span");

        element.classList.add("word");

        element.textContent =
            wordData.word;

        wordListElement.appendChild(element);

    });

}


/* --------------------------------
   BUTTON
-------------------------------- */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* --------------------------------
   START GAME
-------------------------------- */

generateBoard();
