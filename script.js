const BOARD_SIZE = 10;

const CENTRE_ROW = 4;
const CENTRE_COL = 4;

const TARGET_WORD_COUNT = 12;

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 6;


/* --------------------------------
   HTML ELEMENTS
-------------------------------- */

const boardElement =
    document.getElementById("board");

const generateButton =
    document.getElementById("generateButton");

const wordCountElement =
    document.getElementById("wordCount");

const wordListElement =
    document.getElementById("wordList");


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

            const cell =
                document.createElement("div");

            cell.className = "cell";


            const letter =
                board[row][col];


            if (letter) {

                cell.textContent = letter;

                cell.classList.add("letter");

            }


            boardElement.appendChild(cell);

        }

    }

}


/* --------------------------------
   DISPLAY WORDS
-------------------------------- */

function displayWords() {

    wordCountElement.textContent =
        `${placedWords.length} words`;


    wordListElement.innerHTML = "";


    placedWords.forEach(wordData => {

        const element =
            document.createElement("span");


        element.className = "word";


        element.textContent =
            wordData.word;


        wordListElement.appendChild(
            element
        );

    });

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

function getPosition(
    row,
    col,
    direction,
    index
) {

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
   CHECK IF WORD FITS
-------------------------------- */

function wordFits(
    word,
    row,
    col,
    direction
) {

    for (let i = 0; i < word.length; i++) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        if (
            !isInsideBoard(
                position.row,
                position.col
            )
        ) {

            return false;

        }


        const existingLetter =
            board[
                position.row
            ][
                position.col
            ];


        /*
           If a letter already exists,
           it must match.
        */

        if (
            existingLetter &&
            existingLetter !== word[i]
        ) {

            return false;

        }

    }


    return true;

}


/* --------------------------------
   CHECK WORD CONNECTS
-------------------------------- */

function wordTouchesBoard(
    word,
    row,
    col,
    direction
) {

    /*
       First word doesn't need to
       connect to anything.
    */

    if (placedWords.length === 0) {

        return true;

    }


    for (let i = 0; i < word.length; i++) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        /*
           Existing letter means
           the words cross.
        */

        if (
            board[
                position.row
            ][
                position.col
            ]
        ) {

            return true;

        }


        /*
           Check neighbouring squares.
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


        for (
            const neighbour
            of neighbours
        ) {

            if (
                !isInsideBoard(
                    neighbour.row,
                    neighbour.col
                )
            ) {

                continue;

            }


            if (
                board[
                    neighbour.row
                ][
                    neighbour.col
                ]
            ) {

                return true;

            }

        }

    }


    return false;

}


/* --------------------------------
   CAN PLACE WORD
-------------------------------- */

function canPlaceWord(
    word,
    row,
    col,
    direction
) {

    word =
        word.toUpperCase();


    /*
       Check length.
    */

    if (
        word.length < MIN_WORD_LENGTH ||
        word.length > MAX_WORD_LENGTH
    ) {

        return false;

    }


    /*
       Check dictionary.
    */

    if (
        !dictionary.includes(word)
    ) {

        return false;

    }


    /*
       Check board boundaries
       and existing letters.
    */

    if (
        !wordFits(
            word,
            row,
            col,
            direction
        )
    ) {

        return false;

    }


    /*
       Later words must connect
       to the existing board.
    */

    if (
        !wordTouchesBoard(
            word,
            row,
            col,
            direction
        )
    ) {

        return false;

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

    word =
        word.toUpperCase();


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
        ] =
            word[i];

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

    if (
        dictionary.length === 0
    ) {

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
   TRY TO ADD WORD
-------------------------------- */

function tryAddWord() {

    for (
        let attempt = 0;
        attempt < 50;
        attempt++
    ) {

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
                Math.random() *
                BOARD_SIZE
            );


        const col =
            Math.floor(
                Math.random() *
                BOARD_SIZE
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

       On a 10×10 board the centre
       is approximately row 4,
       column 4.

       We place SCRABBLE horizontally
       starting at column 1.
    */

    placeWord(
        "SCRABBLE",
        4,
        1,
        "horizontal"
    );


    displayBoard();

    displayWords();


    /*
       Add words gradually so the
       browser doesn't freeze.
    */

    function addWords() {

        let attempts = 0;


        while (
            placedWords.length <
                TARGET_WORD_COUNT &&
            attempts < 20
        ) {

            tryAddWord();

            attempts++;

        }


        displayBoard();

        displayWords();


        if (
            placedWords.length <
                TARGET_WORD_COUNT
        ) {

            setTimeout(
                addWords,
                20
            );

        }

    }


    addWords();

}


/* --------------------------------
   LOAD DICTIONARY
-------------------------------- */

async function loadDictionary() {

    try {

        const response =
            await fetch(
                "dictionary.txt"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load dictionary.txt"
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


        dictionary =
            [...new Set(dictionary)];


        console.log(
            "Dictionary loaded:",
            dictionary.length,
            "words"
        );


        generateBoard();

    }
    catch (error) {

        console.error(error);


        createEmptyBoard();

        placedWords = [];


        /*
           Still show the board if
           dictionary.txt fails.
        */

        placeWord(
            "SCRABBLE",
            4,
            1,
            "horizontal"
        );


        displayBoard();

        displayWords();


        wordListElement.textContent =
            "Could not load dictionary.txt";

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
