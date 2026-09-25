const BOARD_SIZE = 10;

const CENTRE_ROW = 4;
const CENTRE_COL = 4;

const TARGET_WORD_COUNT = 12;

const MIN_WORD_LENGTH = 2;
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
   DISPLAY WORD LIST
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
   BOARD POSITION
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
   GET LETTER POSITION
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
   MAKE COPY OF BOARD
-------------------------------- */

function copyBoard() {

    return board.map(
        row => [...row]
    );

}


/* --------------------------------
   PUT WORD ON TEST BOARD
-------------------------------- */

function putWordOnBoard(
    testBoard,
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


        testBoard[
            position.row
        ][
            position.col
        ] =
            word[i];

    }

}


/* --------------------------------
   GET WORD STARTING AT CELL
-------------------------------- */

function getWord(
    testBoard,
    row,
    col,
    direction
) {

    let startRow = row;

    let startCol = col;


    /*
       Move backwards until we find
       the beginning of the word.
    */

    while (true) {

        let previousRow =
            startRow;

        let previousCol =
            startCol;


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
            !testBoard[
                previousRow
            ][
                previousCol
            ]
        ) {

            break;

        }


        startRow =
            previousRow;

        startCol =
            previousCol;

    }


    /*
       Read the word forwards.
    */

    let word = "";

    let currentRow =
        startRow;

    let currentCol =
        startCol;


    while (
        isInsideBoard(
            currentRow,
            currentCol
        )
    ) {

        const letter =
            testBoard[
                currentRow
            ][
                currentCol
            ];


        if (!letter) {

            break;

        }


        word += letter;


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
   GET ALL WORDS ON BOARD
-------------------------------- */

function getAllBoardWords(testBoard) {

    const words = [];


    /*
       --------------------------------
       HORIZONTAL WORDS
       --------------------------------
    */

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        let col = 0;


        while (col < BOARD_SIZE) {

            /*
               Find first letter.
            */

            if (
                !testBoard[row][col]
            ) {

                col++;

                continue;

            }


            /*
               Find the complete word.
            */

            let word = "";


            while (
                col < BOARD_SIZE &&
                testBoard[row][col]
            ) {

                word +=
                    testBoard[row][col];

                col++;

            }


            /*
               Only words of 2+ letters
               need dictionary validation.
            */

            if (word.length >= 2) {

                words.push(word);

            }

        }

    }


    /*
       --------------------------------
       VERTICAL WORDS
       --------------------------------
    */

    for (
        let col = 0;
        col < BOARD_SIZE;
        col++
    ) {

        let row = 0;


        while (row < BOARD_SIZE) {

            /*
               Find first letter.
            */

            if (
                !testBoard[row][col]
            ) {

                row++;

                continue;

            }


            /*
               Find complete word.
            */

            let word = "";


            while (
                row < BOARD_SIZE &&
                testBoard[row][col]
            ) {

                word +=
                    testBoard[row][col];

                row++;

            }


            /*
               Only words of 2+ letters
               need validation.
            */

            if (word.length >= 2) {

                words.push(word);

            }

        }

    }


    return words;

}


/* --------------------------------
   CHECK ENTIRE BOARD
-------------------------------- */

function isEntireBoardValid(testBoard) {

    const words =
        getAllBoardWords(testBoard);


    /*
       Every word on the board must
       exist in dictionary.txt.
    */

    for (
        const word of words
    ) {

        if (
            !dictionary.includes(word)
        ) {

            return false;

        }

    }


    return true;

}


/* --------------------------------
   CHECK WORD FIT
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


        /*
           Word must remain inside
           the board.
        */

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
           it MUST be the same letter.
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
   WORD MUST CROSS EXISTING WORD
-------------------------------- */

function wordCrossesExistingLetter(
    word,
    row,
    col,
    direction
) {

    /*
       The first word doesn't need
       to cross anything.
    */

    if (
        placedWords.length === 0
    ) {

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
           If this square already
           contains a letter, the new
           word is crossing an existing
           word.
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

    }


    return false;

}


/* --------------------------------
   CHECK WORD PLACEMENT
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
       --------------------------------
       LENGTH
       --------------------------------
    */

    if (
        word.length < MIN_WORD_LENGTH ||
        word.length > MAX_WORD_LENGTH
    ) {

        return false;

    }


    /*
       --------------------------------
       DICTIONARY
       --------------------------------
    */

    if (
        !dictionary.includes(word)
    ) {

        return false;

    }


    /*
       --------------------------------
       FIT
       --------------------------------
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
       --------------------------------
       MUST CROSS
       --------------------------------
    */

    if (
        !wordCrossesExistingLetter(
            word,
            row,
            col,
            direction
        )
    ) {

        return false;

    }


    /*
       --------------------------------
       TEST BOARD
       --------------------------------
    */

    const testBoard =
        copyBoard();


    putWordOnBoard(
        testBoard,
        word,
        row,
        col,
        direction
    );


    /*
       --------------------------------
       VALIDATE ENTIRE BOARD
       --------------------------------

       This is the important part.

       Every horizontal AND vertical
       word must exist in dictionary.txt.
    */

    if (
        !isEntireBoardValid(
            testBoard
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
       Try a limited number of
       possibilities.
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


        /*
           Pick horizontal or vertical.
        */

        const direction =
            Math.random() < 0.5
                ? "horizontal"
                : "vertical";


        /*
           Pick random starting point.
        */

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


        /*
           Check whether this creates
           a completely valid board.
        */

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
       Start fresh.
    */

    createEmptyBoard();

    placedWords = [];


    /*
       --------------------------------
       FIRST WORD
       --------------------------------

       SCRABBLE is placed horizontally.

       On the 10×10 board:

       row 4
       starting column 1

       means the word crosses the
       centre area.
    */

    placeWord(
        "SCRABBLE",
        4,
        1,
        "horizontal"
    );


    /*
       Show the first word immediately.
    */

    displayBoard();

    displayWords();


    /*
       Add additional words gradually.
    */

    function addWords() {

        let attempts = 0;

        let wordsAdded = 0;


        /*
           Only make a small number of
           attempts at once.
        */

        while (
            placedWords.length <
                TARGET_WORD_COUNT &&
            attempts < 30
        ) {

            const added =
                tryAddWord();


            if (added) {

                wordsAdded++;

            }


            attempts++;

        }


        /*
           Update screen.
        */

        displayBoard();

        displayWords();


        /*
           Continue generating if we
           haven't reached our target.
        */

        if (
            placedWords.length <
                TARGET_WORD_COUNT &&
            wordsAdded > 0
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


        /*
           Turn dictionary.txt into
           an array of uppercase words.
        */

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
           Start generating.
        */

        generateBoard();

    }
    catch (error) {

        console.error(
            "Dictionary error:",
            error
        );


        /*
           Display the board anyway.
        */

        createEmptyBoard();

        placedWords = [];


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
