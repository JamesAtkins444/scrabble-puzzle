const BOARD_SIZE = 15;

const CENTRE_ROW = 7;
const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 25;

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


/* --------------------------------
   DISPLAY BOARD
-------------------------------- */

function displayBoard() {

    boardElement.innerHTML = "";


    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.classList.add("cell");


            const letter =
                board[row][col];


            if (letter) {

                cell.textContent =
                    letter;

                cell.classList.add(
                    "letter"
                );

            }


            boardElement.appendChild(
                cell
            );

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
   GET CELL FROM BOARD
-------------------------------- */

function getCell(row, col, boardToRead = board) {

    if (
        !isInsideBoard(row, col)
    ) {

        return null;

    }

    return boardToRead[row][col];

}


/* --------------------------------
   GET WORD LETTER POSITION
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
   GET OPPOSITE DIRECTION
-------------------------------- */

function getOppositeDirection(direction) {

    if (
        direction === "horizontal"
    ) {

        return "vertical";

    }

    return "horizontal";

}


/* --------------------------------
   GET WORD FROM BOARD
-------------------------------- */

function getWordAtPosition(
    row,
    col,
    direction,
    boardToRead = board
) {

    let startRow = row;

    let startCol = col;


    /*
       Move backwards until we find
       the beginning of the word.
    */

    while (true) {

        const previousRow =
            direction === "vertical"
                ? startRow - 1
                : startRow;

        const previousCol =
            direction === "horizontal"
                ? startCol - 1
                : startCol;


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


    /*
       Read the complete word forwards.
    */

    let word = "";

    let currentRow = startRow;

    let currentCol = startCol;


    while (
        isInsideBoard(
            currentRow,
            currentCol
        ) &&
        boardToRead[
            currentRow
        ][
            currentCol
        ]
    ) {

        word +=
            boardToRead[
                currentRow
            ][
                currentCol
            ];


        if (
            direction === "horizontal"
        ) {

            currentCol++;

        } else {

            currentRow++;

        }

    }


    return word;

}


/* --------------------------------
   CREATE TEMPORARY BOARD
-------------------------------- */

function createTemporaryBoard(
    word,
    row,
    col,
    direction
) {

    const temporaryBoard =
        board.map(
            currentRow =>
                [...currentRow]
        );


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


        temporaryBoard[
            position.row
        ][
            position.col
        ] =
            word[i];

    }


    return temporaryBoard;

}


/* --------------------------------
   CHECK WORD IS IN DICTIONARY
-------------------------------- */

function isValidDictionaryWord(word) {

    return dictionary.includes(
        word.toUpperCase()
    );

}


/* --------------------------------
   CHECK CANDIDATE WORD
-------------------------------- */

function canPlaceWord(
    word,
    row,
    col,
    direction
) {

    word =
        word.toUpperCase();


    /* ----------------------------
       BASIC WORD CHECK
    ---------------------------- */

    if (
        word.length <
        MIN_WORD_LENGTH
    ) {

        return false;

    }


    if (
        word.length >
        MAX_WORD_LENGTH
    ) {

        return false;

    }


    if (
        !isValidDictionaryWord(word)
    ) {

        return false;

    }


    /* ----------------------------
       CHECK BOUNDARIES
    ---------------------------- */

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


    /* ----------------------------
       CHECK EACH TILE
    ---------------------------- */

    let overlapsExistingTile =
        false;

    let touchesExistingTile =
        false;


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


        const existingLetter =
            getCell(
                position.row,
                position.col
            );


        /*
           If a tile already exists,
           it must contain the same
           letter.
        */

        if (existingLetter) {

            if (
                existingLetter !== word[i]
            ) {

                return false;

            }


            overlapsExistingTile = true;

        }


        /*
           Check the four neighbouring
           squares.

           This determines whether the
           new word connects to the
           existing board.
        */

        const neighbours = [

            {
                row:
                    position.row - 1,
                col:
                    position.col
            },

            {
                row:
                    position.row + 1,
                col:
                    position.col
            },

            {
                row:
                    position.row,
                col:
                    position.col - 1
            },

            {
                row:
                    position.row,
                col:
                    position.col + 1
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


            /*
               Don't count another tile
               that is part of the candidate
               word as a connection.
            */

            const isPartOfCandidate =

                direction === "horizontal"
                    ? (
                        neighbour.row ===
                            position.row &&
                        neighbour.col >= col &&
                        neighbour.col <
                            col + word.length
                    )
                    : (
                        neighbour.col ===
                            position.col &&
                        neighbour.row >= row &&
                        neighbour.row <
                            row + word.length
                    );


            if (isPartOfCandidate) {

                continue;

            }


            if (
                board[
                    neighbour.row
                ][
                    neighbour.col
                ]
            ) {

                touchesExistingTile =
                    true;

            }

        }

    }


    /* ----------------------------
       FIRST WORD
    ---------------------------- */

    if (
        placedWords.length === 0
    ) {

        /*
           The first word must cover
           the centre square.
        */

        let coversCentre = false;


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
                position.row ===
                    CENTRE_ROW &&
                position.col ===
                    CENTRE_COL
            ) {

                coversCentre = true;

                break;

            }

        }


        return coversCentre;

    }


    /* ----------------------------
       MUST CONNECT
    ---------------------------- */

    if (
        !overlapsExistingTile &&
        !touchesExistingTile
    ) {

        return false;

    }


    /* ----------------------------
       CREATE TEMP BOARD
    ---------------------------- */

    const temporaryBoard =
        createTemporaryBoard(
            word,
            row,
            col,
            direction
        );


    /* ----------------------------
       CHECK MAIN WORD
    ---------------------------- */

    const mainWord =
        getWordAtPosition(
            row,
            col,
            direction,
            temporaryBoard
        );


    if (
        !isValidDictionaryWord(
            mainWord
        )
    ) {

        return false;

    }


    /* ----------------------------
       CHECK CROSS WORDS
    ---------------------------- */

    const oppositeDirection =
        getOppositeDirection(
            direction
        );


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
           If this position already had
           a tile, it isn't creating a
           brand new crossing word.
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
                oppositeDirection,
                temporaryBoard
            );


        /*
           A single letter isn't a word
           and doesn't need dictionary
           validation.
        */

        if (
            crossWord.length > 1 &&
            !isValidDictionaryWord(
                crossWord
            )
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
       Try many random possibilities.
    */

    for (
        let attempt = 0;
        attempt < 1000;
        attempt++
    ) {

        const word =
            getRandomWord();


        if (!word) {

            return false;

        }


        if (
            word.length <
            MIN_WORD_LENGTH ||
            word.length >
            MAX_WORD_LENGTH
        ) {

            continue;

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
       --------------------------------
       FIRST WORD
       --------------------------------

       SCRABBLE is deliberately used
       as the starting word for now.

       It is placed horizontally
       across the centre square.
    */

    const firstWord =
        "SCRABBLE";


    const firstWordStartRow =
        CENTRE_ROW;


    const firstWordStartCol =
        CENTRE_COL - 3;


    placeWord(
        firstWord,
        firstWordStartRow,
        firstWordStartCol,
        "horizontal"
    );


    /*
       --------------------------------
       ADD MORE WORDS
       --------------------------------
    */

    let failedAttempts = 0;


    while (
        placedWords.length <
            TARGET_WORD_COUNT &&
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
        "Generated board with",
        placedWords.length,
        "words"
    );


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


    placedWords.forEach(
        wordData => {

            const element =
                document.createElement("span");


            element.classList.add(
                "word"
            );


            element.textContent =
                wordData.word;


            wordListElement.appendChild(
                element
            );

        }
    );

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


        /*
           Remove duplicate words.
        */

        dictionary =
            [...new Set(dictionary)];


        console.log(
            `Loaded ${dictionary.length} dictionary words`
        );


        if (
            dictionary.length === 0
        ) {

            throw new Error(
                "Dictionary is empty"
            );

        }


        /*
           Generate the first board
           automatically.
        */

        generateBoard();

    }
    catch (error) {

        console.error(
            "Dictionary loading error:",
            error
        );


        wordCountElement.textContent =
            "Could not load dictionary";


        wordListElement.textContent =
            "Make sure dictionary.txt is in the same folder as index.html.";

    }

}


/* --------------------------------
   GENERATE BUTTON
-------------------------------- */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* --------------------------------
   START
-------------------------------- */

loadDictionary();
