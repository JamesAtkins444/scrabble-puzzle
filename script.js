const BOARD_SIZE = 10;

const CENTRE_ROW = 4;
const CENTRE_COL = 4;

const TARGET_WORD_COUNT = 9;

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

let dictionarySet = new Set();


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
   COPY BOARD
-------------------------------- */

function copyBoard() {

    return board.map(
        row => [...row]
    );

}


/* --------------------------------
   PLACE WORD ON TEST BOARD
-------------------------------- */

function putWord(
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
   GET WORD FROM CELL
-------------------------------- */

function readWord(
    testBoard,
    row,
    col,
    direction
) {

    let startRow = row;

    let startCol = col;


    /*
       Move backwards to the
       beginning of the word.
    */

    while (true) {

        let previousRow =
            startRow;

        let previousCol =
            startCol;


        if (
            direction ===
            "horizontal"
        ) {

            previousCol--;

        }
        else {

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
       Read forwards.
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
            direction ===
            "horizontal"
        ) {

            currentCol++;

        }
        else {

            currentRow++;

        }

    }


    return word;

}


/* --------------------------------
   GET ALL BOARD WORDS
-------------------------------- */

function getAllBoardWords(
    testBoard
) {

    const words = [];


    /*
       HORIZONTAL
    */

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

            if (
                !testBoard[row][col]
            ) {

                continue;

            }


            /*
               Only start reading if
               this is the first letter.
            */

            if (
                col > 0 &&
                testBoard[row][col - 1]
            ) {

                continue;

            }


            const word =
                readWord(
                    testBoard,
                    row,
                    col,
                    "horizontal"
                );


            if (word.length >= 2) {

                words.push(word);

            }

        }

    }


    /*
       VERTICAL
    */

    for (
        let col = 0;
        col < BOARD_SIZE;
        col++
    ) {

        for (
            let row = 0;
            row < BOARD_SIZE;
            row++
        ) {

            if (
                !testBoard[row][col]
            ) {

                continue;

            }


            /*
               Only start reading if
               this is the first letter.
            */

            if (
                row > 0 &&
                testBoard[row - 1][col]
            ) {

                continue;

            }


            const word =
                readWord(
                    testBoard,
                    row,
                    col,
                    "vertical"
                );


            if (word.length >= 2) {

                words.push(word);

            }

        }

    }


    return words;

}


/* --------------------------------
   CHECK BOARD VALIDITY
-------------------------------- */

function isBoardValid(
    testBoard
) {

    const words =
        getAllBoardWords(
            testBoard
        );


    for (
        const word of words
    ) {

        if (
            !dictionarySet.has(word)
        ) {

            return false;

        }

    }


    return true;

}


/* --------------------------------
   GET EXISTING LETTERS
-------------------------------- */

function getExistingLetters() {

    const result = [];


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

            if (
                board[row][col]
            ) {

                result.push({

                    row: row,

                    col: col,

                    letter:
                        board[row][col]

                });

            }

        }

    }


    return result;

}


/* --------------------------------
   TRY PLACE WORD
-------------------------------- */

function tryPlaceWord(
    word,
    row,
    col,
    direction
) {

    /*
       Check length.
    */

    if (
        word.length <
        MIN_WORD_LENGTH ||
        word.length >
        MAX_WORD_LENGTH
    ) {

        return false;

    }


    /*
       Check dictionary.
    */

    if (
        !dictionarySet.has(word)
    ) {

        return false;

    }


    /*
       Check position.
    */

    let overlaps = false;

    let addsNewTile = false;


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


        const existing =
            board[
                position.row
            ][
                position.col
            ];


        if (existing) {

            if (
                existing !== word[i]
            ) {

                return false;

            }


            overlaps = true;

        }
        else {

            addsNewTile = true;

        }

    }


    /*
       A new word MUST cross
       an existing letter.
    */

    if (!overlaps) {

        return false;

    }


    /*
       It must add something new.
    */

    if (!addsNewTile) {

        return false;

    }


    /*
       Create test board.
    */

    const testBoard =
        copyBoard();


    putWord(
        testBoard,
        word,
        row,
        col,
        direction
    );


    /*
       Every word on the board
       must be valid.
    */

    if (
        !isBoardValid(
            testBoard
        )
    ) {

        return false;

    }


    /*
       SUCCESS
    */

    board =
        testBoard;


    placedWords.push({

        word: word,

        row: row,

        col: col,

        direction: direction

    });


    return true;

}


/* --------------------------------
   FIND CROSSING WORD
-------------------------------- */

function findCrossingWord() {

    const existingLetters =
        getExistingLetters();


    /*
       Shuffle the letters so that
       each generation is slightly
       different.
    */

    const shuffledLetters =
        shuffle(
            existingLetters
        );


    for (
        const existing
        of shuffledLetters
    ) {

        /*
           Get words containing
           this exact letter.
        */

        const candidates =
            dictionary.filter(
                word =>
                    word.includes(
                        existing.letter
                    )
            );


        const shuffledCandidates =
            shuffle(candidates);


        /*
           Try up to 150 candidates
           for this letter.
        */

        const limitedCandidates =
            shuffledCandidates.slice(
                0,
                150
            );


        for (
            const word
            of limitedCandidates
        ) {

            /*
               Find every occurrence
               of the matching letter.
            */

            for (
                let i = 0;
                i < word.length;
                i++
            ) {

                if (
                    word[i] !==
                    existing.letter
                ) {

                    continue;

                }


                /*
                   IMPORTANT:

                   If the existing word is
                   horizontal, we prefer a
                   vertical crossing.

                   If it is vertical, we
                   prefer horizontal.

                   This produces an actual
                   crossword structure.
                */

                let existingDirection =
                    "horizontal";


                for (
                    const placed
                    of placedWords
                ) {

                    if (
                        isCellInWord(
                            existing.row,
                            existing.col,
                            placed
                        )
                    ) {

                        existingDirection =
                            placed.direction;

                        break;

                    }

                }


                const newDirection =
                    existingDirection ===
                    "horizontal"
                        ? "vertical"
                        : "horizontal";


                /*
                   Calculate the starting
                   position.
                */

                let newRow;
                let newCol;


                if (
                    newDirection ===
                    "horizontal"
                ) {

                    newRow =
                        existing.row;

                    newCol =
                        existing.col - i;

                }
                else {

                    newRow =
                        existing.row - i;

                    newCol =
                        existing.col;

                }


                if (
                    tryPlaceWord(
                        word,
                        newRow,
                        newCol,
                        newDirection
                    )
                ) {

                    return true;

                }

            }

        }

    }


    return false;

}


/* --------------------------------
   IS CELL PART OF WORD
-------------------------------- */

function isCellInWord(
    row,
    col,
    wordData
) {

    for (
        let i = 0;
        i < wordData.word.length;
        i++
    ) {

        const position =
            getPosition(
                wordData.row,
                wordData.col,
                wordData.direction,
                i
            );


        if (
            position.row === row &&
            position.col === col
        ) {

            return true;

        }

    }


    return false;

}


/* --------------------------------
   SHUFFLE
-------------------------------- */

function shuffle(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}


/* --------------------------------
   GENERATE BOARD
-------------------------------- */

function generateBoard() {

    createEmptyBoard();

    placedWords = [];


    /*
       First word.

       SCRABBLE is centred on
       the board.
    */

    const firstWord =
        "business";


    const firstRow =
        CENTRE_ROW;


    const firstCol =
        CENTRE_COL -
        Math.floor(
            firstWord.length / 2
        );


    for (
        let i = 0;
        i < firstWord.length;
        i++
    ) {

        board[
            firstRow
        ][
            firstCol + i
        ] =
            firstWord[i];

    }


    placedWords.push({

        word: firstWord,

        row: firstRow,

        col: firstCol,

        direction: "horizontal"

    });


    displayBoard();

    displayWords();


    /*
       Add words one at a time.
    */

    let failedAttempts = 0;


    function addWord() {

        if (
            placedWords.length >=
            TARGET_WORD_COUNT
        ) {

            console.log(
                "Finished generating board."
            );

            return;

        }


        const success =
            findCrossingWord();


        if (success) {

            failedAttempts = 0;

            displayBoard();

            displayWords();

        }
        else {

            failedAttempts++;

        }


        /*
           Stop if we have tried
           repeatedly without finding
           anything.
        */

        if (
            failedAttempts >= 10
        ) {

            console.log(
                "No more valid words found."
            );

            console.log(
                "Final word count:",
                placedWords.length
            );

            return;

        }


        setTimeout(
            addWord,
            30
        );

    }


    addWord();

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


        dictionary =
            [
                ...new Set(dictionary)
            ];


        dictionarySet =
            new Set(dictionary);


        console.log(
            "Dictionary words:",
            dictionary.length
        );


        /*
           Useful debugging information.
        */

        console.log(
            "SCRABBLE exists:",
            dictionarySet.has(
                "SCRABBLE"
            )
        );


        console.log(
            "Words containing S:",
            dictionary.filter(
                word =>
                    word.includes("S")
            ).length
        );


        console.log(
            "Words containing C:",
            dictionary.filter(
                word =>
                    word.includes("C")
            ).length
        );


        generateBoard();

    }
    catch (error) {

        console.error(error);

        createEmptyBoard();

        placedWords = [];


        /*
           Put SCRABBLE in the
           centre as a fallback.
        */

        const word =
            "SCRABBLE";


        const row =
            CENTRE_ROW;


        const col =
            CENTRE_COL -
            Math.floor(
                word.length / 2
            );


        for (
            let i = 0;
            i < word.length;
            i++
        ) {

            board[row][col + i] =
                word[i];

        }


        placedWords.push({

            word: word,

            row: row,

            col: col,

            direction:
                "horizontal"

        });


        displayBoard();

        displayWords();

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
