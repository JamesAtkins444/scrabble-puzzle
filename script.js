const BOARD_SIZE = 15;

const CENTRE_ROW = 7;
const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 20;

const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 8;


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

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

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
           If there is already a letter,
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
   CHECK WORD TOUCHES BOARD
-------------------------------- */

function wordTouchesBoard(
    word,
    row,
    col,
    direction
) {

    /*
       The first word doesn't need
       to touch anything.
    */

    if (placedWords.length === 0) {

        return true;

    }


    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        const position =
            getPosition(
                row,
                col,
                direction,
                i
            );


        /*
           Existing letter on the same
           square = word crossing.
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
           Check four neighbouring
           squares.
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
   CHECK CROSSING WORDS
-------------------------------- */

function checkCrossWords(
    word,
    row,
    col,
    direction
) {

    /*
       Create a temporary copy of
       the board.
    */

    const testBoard =
        board.map(
            rowArray => [...rowArray]
        );


    /*
       Put the new word onto the
       temporary board.
    */

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

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


    /*
       For this stage we're only
       checking that the new word
       itself doesn't conflict with
       existing letters.

       Cross-word validation will be
       made stricter in the next step.
    */

    return true;

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


    if (
        word.length < MIN_WORD_LENGTH ||
        word.length > MAX_WORD_LENGTH
    ) {

        return false;

    }


    /*
       Make sure the word exists in
       our dictionary.
    */

    if (
        !dictionary.includes(word)
    ) {

        return false;

    }


    /*
       Make sure the word fits.
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
       Make sure it connects to the
       existing board.
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


    /*
       Basic crossing check.
    */

    if (
        !checkCrossWords(
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


    for (
        let i = 0;
        i < word.length;
        i++
    ) {

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

    /*
       Only try 100 possibilities.

       This prevents the browser from
       getting stuck.
    */

    for (
        let attempt = 0;
        attempt < 100;
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

    /*
       Start with a completely empty
       board.
    */

    createEmptyBoard();

    placedWords = [];


    /*
       --------------------------------
       FIRST WORD
       --------------------------------

       SCRABBLE goes across the centre.
    */

    placeWord(
        "SCRABBLE",
        CENTRE_ROW,
        4,
        "horizontal"
    );


    /*
       IMPORTANT:

       Display the board immediately.

       This means we will always see
       something even if generation
       takes a while.
    */

    displayBoard();

    displayWords();


    /*
       Add words one at a time.

       A tiny delay between groups
       prevents the browser from
       freezing.
    */

    let wordsAdded = 0;


    function addNextWords() {

        let attempts = 0;


        while (
            placedWords.length <
                TARGET_WORD_COUNT &&
            attempts < 20
        ) {

            const added =
                tryAddWord();


            if (added) {

                wordsAdded++;

            }


            attempts++;

        }


        /*
           Update the visible board.
        */

        displayBoard();

        displayWords();


        /*
           Continue if we still want
           more words.
        */

        if (
            placedWords.length <
                TARGET_WORD_COUNT
        ) {

            setTimeout(
                addNextWords,
                10
            );

        }

    }


    addNextWords();

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


        /*
           Generate the board.
        */

        generateBoard();

    }
    catch (error) {

        console.error(
            error
        );


        /*
           Even if the dictionary fails,
           show SCRABBLE on the board.
        */

        createEmptyBoard();

        placedWords = [];


        placeWord(
            "SCRABBLE",
            CENTRE_ROW,
            4,
            "horizontal"
        );


        displayBoard();

        displayWords();


        wordCountElement.textContent =
            "Dictionary could not be loaded";


        wordListElement.textContent =
            "Check that dictionary.txt is in the same folder as index.html.";

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
