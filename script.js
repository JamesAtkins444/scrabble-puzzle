```javascript
/* =========================================
   SCRABBLE PUZZLE
   ========================================= */


/* =========================================
   BOARD SETTINGS
   ========================================= */

const BOARD_SIZE = 15;

const CENTRE_ROW = 7;

const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 12;


/* =========================================
   WORD LENGTH SETTINGS
   ========================================= */

/*
   Words deliberately generated after
   the starting word must be between
   3 and 8 letters.
*/

const MIN_WORD_LENGTH = 3;

const MAX_WORD_LENGTH = 8;


/*
   The first word must be at least
   11 letters long.
*/

const STARTING_WORD_MIN_LENGTH = 11;


/* =========================================
   SCRABBLE TILE VALUES
   ========================================= */

const SCRABBLE_TILES = {

    A: { value: 1, count: 9 },

    B: { value: 3, count: 2 },

    C: { value: 3, count: 2 },

    D: { value: 2, count: 4 },

    E: { value: 1, count: 12 },

    F: { value: 4, count: 2 },

    G: { value: 2, count: 3 },

    H: { value: 4, count: 2 },

    I: { value: 1, count: 9 },

    J: { value: 8, count: 1 },

    K: { value: 5, count: 1 },

    L: { value: 1, count: 4 },

    M: { value: 3, count: 2 },

    N: { value: 1, count: 6 },

    O: { value: 1, count: 8 },

    P: { value: 3, count: 2 },

    Q: { value: 10, count: 1 },

    R: { value: 1, count: 6 },

    S: { value: 1, count: 4 },

    T: { value: 1, count: 6 },

    U: { value: 1, count: 4 },

    V: { value: 4, count: 2 },

    W: { value: 4, count: 2 },

    X: { value: 8, count: 1 },

    Y: { value: 4, count: 2 },

    Z: { value: 10, count: 1 },

    BLANK: { value: 0, count: 2 }

};


/* =========================================
   SCRABBLE FUNCTIONS
   ========================================= */

function getTotalTileCount() {

    let total = 0;

    for (const letter in SCRABBLE_TILES) {

        total += SCRABBLE_TILES[letter].count;

    }

    return total;

}


function getLetterValue(letter) {

    const upperLetter =
        letter.toUpperCase();

    if (SCRABBLE_TILES[upperLetter]) {

        return SCRABBLE_TILES[upperLetter].value;

    }

    return 0;

}


function calculateWordScore(word) {

    let score = 0;

    for (const letter of word) {

        score += getLetterValue(letter);

    }

    return score;

}


/* =========================================
   HTML ELEMENTS
   ========================================= */

const boardElement =
    document.getElementById("board");


const generateButton =
    document.getElementById("generateButton");


const wordCountElement =
    document.getElementById("wordCount");


const wordListElement =
    document.getElementById("wordList");


/* =========================================
   GAME DATA
   ========================================= */

let board = [];

let placedWords = [];

let dictionary = [];

let dictionarySet = new Set();


/* =========================================
   CREATE EMPTY BOARD
   ========================================= */

function createEmptyBoard() {

    board = [];

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        board[row] = [];

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            board[row][col] = null;

        }

    }

}


/* =========================================
   CHECK BOARD POSITION
   ========================================= */

function isInsideBoard(row, col) {

    return (

        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE

    );

}


/* =========================================
   GET BOARD POSITION
   ========================================= */

function getPosition(
    row,
    col
) {

    if (
        !isInsideBoard(
            row,
            col
        )
    ) {

        return null;

    }

    return board[row][col];

}


/* =========================================
   COPY BOARD
   ========================================= */

function copyBoard(sourceBoard) {

    return sourceBoard.map(
        row => [...row]
    );

}


/* =========================================
   PLACE WORD
   ========================================= */

f
```
