const BOARD_SIZE = 15;

const CENTRE_ROW = 7;
const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 25;

const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 8;


/* --------------------------------
   HTML ELEMENTS
-------------------------------- */

const boardElement = document.getElementById("board");
const generateButton = document.getElementById("generateButton");
const wordCountElement = document.getElementById("wordCount");
const wordListElement = document.getElementById("wordList");


/* --------------------------------
   GAME DATA
-------------------------------- */

let board = [];
let placedWords = [];
let dictionary = [];


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

            cell.className = "cell";

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
   CHECK BOARD POSITION
-------------------------------- */

function isInsideBoard(row, col) {

    return (
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
    );

}


/* --------------------------------
   GET POSITION
-------------------------------- */

function getPosition(row, col, direction, index) {

    if (direction === "horizontal") {

        return {
            row: row,
            col: col + index
        };

    }

    return {
        row: row + index,
        col: col
    };

}


/* --------------------------------
   GET WORD FROM BOARD
-------------------------------- */

function getWordAtPosition(
    row,
    col,
    direction,
    boardToRead
) {

    let startRow = row;
    let startCol = col;


    /* Move backwards to beginning */

    while (true) {

        let previousRow = startRow;
        let previousCol = startCol;

        if (direction === "horizontal") {

            previousCol--;

        } else {

            previousRow--;

        }


        if (
            !isInsideBoard(
                previousRow,
                previousCol
            )
        ) {

            break;

        }


        if (
            !boardToRead[
                previousRow
            ][
                previousCol
            ]
        ) {

            break;

        }


        startRow = previousRow;
        startCol = previousCol;

    }


    /* Read forwards */

    let word = "";

    let currentRow = startRow;
    let currentCol = startCol;


    while (
        isInsideBoard(
            currentRow,
            currentCol
        )
    ) {

        const letter =
            boardToRead[
                currentRow
            ][
                currentCol
            ];


        if (!letter) {

            break;

        }


        word += letter;


        if (direction === "horizontal") {

            currentCol++;

        } else {

            currentRow++;

        }

    }


    return word;

}


/* --------------------------------
   CHECK DICTIONARY
-------------------------------- */

function isDictionaryWord(word) {

    return dictionary.includes(
        word.toUpperCase()
    );

}


/* --------------------------------
   MAKE TEST BOARD
-------------------------------- */

function makeTestBoard(
    word,
    row,
    col,
    direction
) {

    const testBoard =
        board.map(
            rowArray => [...rowArray]
        );


    for (let i = 0; i < word.length; i++) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        testBoard[
            position.row
        ][
            position.col
        ] = word[i];

    }


    return testBoard;

}


/* --------------------------------
   CHECK IF WORD CAN BE PLACED
-------------------------------- */

function canPlaceWord(
    word,
    row,
    col,
    direction
) {

    word = word.toUpperCase();


    /* Check word length */

    if (
        word.length < MIN_WORD_LENGTH ||
        word.length > MAX_WORD_LENGTH
    ) {

        return false;

    }


    /* Check dictionary */

    if (!isDictionaryWord(word)) {

        return false;

    }


    /* Check position */

    const finalPosition =
        getPosition(
            row,
            col,
            direction,
            word.length - 1
        );


    if (
        !isInsideBoard(
            finalPosition.row,
            finalPosition.col
        )
    ) {

        return false;

    }


    let overlaps = false;
    let touches = false;


    /* Check every letter */

    for (let i = 0; i < word.length; i++) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        const existingLetter =
            board[
                position.row
            ][
                position.col
            ];


        /* Existing letter must match */

        if (existingLetter) {

            if (
                existingLetter !== word[i]
            ) {

                return false;

            }

            overlaps = true;

        }


        /*
           Look around the new tile
           for existing tiles.
        */

        const neighbours = [

            {
                row: position.row - 1,
                col: position.col
            },

            {
                row: position.row + 1,
                col: position.col
            },

            {
                row: position.row,
                col: position.col - 1
            },

            {
                row: position.row,
                col: position.col + 1
            }

        ];


        for (const neighbour of neighbours) {

            if (
                !isInsideBoard(
                    neighbour.row,
                    neighbour.col
                )
            ) {

                continue;

            }


            /*
               Ignore tiles that are already
               part of the word we're placing.
            */

            let partOfCandidate = false;


            if (direction === "horizontal") {

                if (
                    neighbour.row === position.row &&
                    neighbour.col >= col &&
                    neighbour.col < col + word.length
                ) {

                    partOfCandidate = true;

                }

            } else {

                if (
                    neighbour.col === position.col &&
                    neighbour.row >= row &&
                    neighbour.row < row + word.length
                ) {

                    partOfCandidate = true;

                }

            }


            if (partOfCandidate) {

                continue;

            }


            if (
                board[
                    neighbour.row
                ][
                    neighbour.col
                ]
            ) {

                touches = true;

            }

        }

    }


    /* --------------------------------
       FIRST WORD
    -------------------------------- */

    if (placedWords.length === 0) {

        let crossesCentre = false;


        for (let i = 0; i < word.length; i++) {

            const position =
                getPosition(
                    row,
                    col,
                    direction,
                    i
                );


            if (
                position.row === CENTRE_ROW &&
                position.col === CENTRE_COL
            ) {

                crossesCentre = true;

            }

        }


        return crossesCentre;

    }


    /* Later words must connect */

    if (!overlaps && !touches) {

        return false;

    }


    /* --------------------------------
       TEST RESULTING WORDS
    -------------------------------- */

    const testBoard =
        makeTestBoard(
            word,
            row,
            col,
            direction
        );


    /* Check main word */

    const mainWord =
        getWordAtPosition(
            row,
            col,
            direction,
            testBoard
        );


    if (
        !isDictionaryWord(mainWord)
    ) {

        return false;

    }


    /* Check crossing words */

    const crossDirection =
        direction === "horizontal"
            ? "vertical"
            : "horizontal";


    for (let i = 0; i < word.length; i++) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        /*
           Existing tiles don't create
           a new crossing word.
        */

        if (
            board[
                position.row
            ][
                position.col
            ]
        ) {

            continue;

        }


        const crossWord =
            getWordAtPosition(
                position.row,
                position.col,
                crossDirection,
                testBoard
            );


        /*
           A single letter is fine.

           A longer word must exist
           in the dictionary.
        */

        if (
            crossWord.length > 1 &&
            !isDictionaryWord(crossWord)
        ) {

            return false;

        }

    }


    return true;

}


/* --------------------------------
   PLACE WORD
-------------------------------- */

function placeWord(
    word,
    row,
    col,
    direction
) {

    word = word.toUpperCase();


    for (let i = 0; i < word.length; i++) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        board[
            position.row
        ][
            position.col
        ] = word[i];

    }


    placedWords.push({

        word: word,

        row: row,

        col: col,

        direction: direction

    });

}


/* --------------------------------
   GET RANDOM WORD
-------------------------------- */

function getRandomWord() {

    if (dictionary.length === 0) {

        return null;

    }


    const index =
        Math.floor(
            Math.random() *
            dictionary.length
        );


    return dictionary[index];

}


/* --------------------------------
   TRY ADD WORD
-------------------------------- */

function tryAddWord() {

    for (let attempt = 0; attempt < 1000; attempt++) {

        const word =
            getRandomWord();


        if (!word) {

            return false;

        }


        const direction =
            Math.random() < 0.5
                ? "horizontal"
                : "vertical";


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
       First word.

       SCRABBLE is 8 letters long.

       Starting at column 4 means
       the word crosses the centre
       column 7.
    */

    const firstWord = "SCRABBLE";


    placeWord(
        firstWord,
        CENTRE_ROW,
        4,
        "horizontal"
    );


    /* Add additional words */

    let failedAttempts = 0;


    while (
        placedWords.length < TARGET_WORD_COUNT &&
        failedAttempts < 3000
    ) {

        const added =
            tryAddWord();


        if (added) {

            failedAttempts = 0;

        } else {

            failedAttempts++;

        }

    }


    console.log(
        "Board generated:",
        placedWords.length,
        "words"
    );


    displayBoard();

    displayWords();

}


/* --------------------------------
   DISPLAY WORDS
-------------------------------- */

function displayWords() {

    wordCountElement.textContent =
        `${placedWords.length} words`;


    wordListElement.innerHTML = "";


    for (const wordData of placedWords) {

        const element =
            document.createElement("span");


        element.className = "word";


        element.textContent =
            wordData.word;


        wordListElement.appendChild(
            element
        );

    }

}


/* --------------------------------
   LOAD DICTIONARY
-------------------------------- */

async function loadDictionary() {

    try {

        console.log(
            "Loading dictionary..."
        );


        const response =
            await fetch(
                "dictionary.txt"
            );


        if (!response.ok) {

            throw new Error(
                "dictionary.txt could not be loaded"
            );

        }


        const text =
            await response.text();


        dictionary =
            text
                .split(/\r?\n/)
                .map(
                    word =>
                        word
                            .trim()
                            .toUpperCase()
                )
                .filter(
                    word =>
                        word.length >=
                        MIN_WORD_LENGTH
                )
                .filter(
                    word =>
                        word.length <=
                        MAX_WORD_LENGTH
                );


        /*
           Remove duplicates.
        */

        dictionary =
            [...new Set(dictionary)];


        console.log(
            "Dictionary loaded:",
            dictionary.length,
            "words"
        );


        if (dictionary.length === 0) {

            throw new Error(
                "Dictionary contains no usable words"
            );

        }


        generateBoard();

    }
    catch (error) {

        console.error(
            "ERROR:",
            error
        );


        /*
           Still show the board even if
           the dictionary fails.

           This makes it much easier to
           diagnose the problem.
        */

        createEmptyBoard();

        placeWord(
            "SCRABBLE",
            CENTRE_ROW,
            4,
            "horizontal"
        );


        displayBoard();


        wordCountElement.textContent =
            "Dictionary error";


        wordListElement.textContent =
            "Could not load dictionary.txt. Check that the file is in the GitHub repository.";

    }

}


/* --------------------------------
   BUTTON
-------------------------------- */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* --------------------------------
   START
-------------------------------- */

loadDictionary();
