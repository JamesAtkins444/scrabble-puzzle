const BOARD_SIZE = 15;

const CENTRE_ROW = 7;
const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 12;

/*
   Crossword words must be
   3-8 letters long.
*/
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

/*
   Starting word must be
   11 letters or longer.
*/
const STARTING_WORD_MIN_LENGTH = 11;


/* --------------------------------
   SCRABBLE TILE DATA
-------------------------------- */

/*
   Standard English Scrabble
   tile distribution and values.
*/

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


/* --------------------------------
   SCRABBLE TOTAL TILE COUNT
-------------------------------- */

function getTotalTileCount() {

    let total = 0;


    for (
        const letter in SCRABBLE_TILES
    ) {

        total +=
            SCRABBLE_TILES[
                letter
            ].count;

    }


    return total;

}


/* --------------------------------
   GET LETTER VALUE
-------------------------------- */

function getLetterValue(
    letter
) {

    const upperLetter =
        letter.toUpperCase();


    if (
        SCRABBLE_TILES[
            upperLetter
        ]
    ) {

        return SCRABBLE_TILES[
            upperLetter
        ].value;

    }


    /*
       Unknown characters have
       no Scrabble value.
    */

    return 0;

}


/* --------------------------------
   CALCULATE WORD SCORE
-------------------------------- */

function calculateWordScore(
    word
) {

    let score = 0;


    for (
        const letter of word
    ) {

        score +=
            getLetterValue(
                letter
            );

    }


    return score;

}


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
                document.createElement(
                    "div"
                );


            cell.className =
                "cell";


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
   DISPLAY WORDS
-------------------------------- */

function displayWords() {

    wordCountElement.textContent =
        `${placedWords.length} words`;


    wordListElement.innerHTML = "";


    placedWords.forEach(
        wordData => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "word";


            /*
               Show word and
               Scrabble value.
            */

            element.textContent =
                `${wordData.word} (${calculateWordScore(wordData.word)})`;


            wordListElement.appendChild(
                element
            );

        }
    );

}


/* --------------------------------
   BOARD POSITION
-------------------------------- */

function isInsideBoard(
    row,
    col
) {

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

    if (
        direction ===
        "horizontal"
    ) {

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
   PUT WORD ON TEST BOARD
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
   READ WORD
-------------------------------- */

function readWord(
    testBoard,
    row,
    col,
    direction
) {

    let startRow = row;

    let startCol = col;


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


            if (
                word.length >= 2
            ) {

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


            if (
                word.length >= 2
            ) {

                words.push(word);

            }

        }

    }


    return words;

}


/* --------------------------------
   CHECK ENTIRE BOARD
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
   CHECK IF CELL IS IN WORD
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
   FIND EXISTING WORD DIRECTION
-------------------------------- */

function getExistingWordDirection(
    row,
    col
) {

    for (
        const wordData
        of placedWords
    ) {

        if (
            isCellInWord(
                row,
                col,
                wordData
            )
        ) {

            return wordData.direction;

        }

    }


    return null;

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

    if (
        word.length <
        MIN_WORD_LENGTH ||
        word.length >
        MAX_WORD_LENGTH
    ) {

        return false;

    }


    if (
        !dictionarySet.has(word)
    ) {

        return false;

    }


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


    if (!overlaps) {

        return false;

    }


    if (!addsNewTile) {

        return false;

    }


    const testBoard =
        copyBoard();


    putWord(
        testBoard,
        word,
        row,
        col,
        direction
    );


    if (
        !isBoardValid(
            testBoard
        )
    ) {

        return false;

    }


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
   SHUFFLE
-------------------------------- */

function shuffle(
    array
) {

    const result =
        [...array];


    for (
        let i =
            result.length - 1;
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
   FIND CROSSING WORD
-------------------------------- */

function findCrossingWord() {

    const existingLetters =
        shuffle(
            getExistingLetters()
        );


    for (
        const existing
        of existingLetters
    ) {

        const candidates =
            dictionary.filter(
                word => {

                    return (
                        word.length >=
                            MIN_WORD_LENGTH &&
                        word.length <=
                            MAX_WORD_LENGTH &&
                        word.includes(
                            existing.letter
                        )
                    );

                }
            );


        const shuffledCandidates =
            shuffle(
                candidates
            );


        for (
            const word
            of shuffledCandidates
        ) {

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


                const existingDirection =
                    getExistingWordDirection(
                        existing.row,
                        existing.col
                    );


                let newDirection;


                if (
                    existingDirection ===
                    "horizontal"
                ) {

                    newDirection =
                        "vertical";

                }
                else {

                    newDirection =
                        "horizontal";

                }


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
   GET STARTING WORD
-------------------------------- */

function getStartingWord() {

    const startingWords =
        dictionary.filter(
            word =>
                word.length >=
                STARTING_WORD_MIN_LENGTH
        );


    console.log(
        "Possible starting words:",
        startingWords
    );


    if (
        startingWords.length === 0
    ) {

        return null;

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            startingWords.length
        );


    return startingWords[
        randomIndex
    ];

}


/* --------------------------------
   PLACE FIRST WORD
-------------------------------- */

function placeFirstWord(
    word
) {

    const row =
        CENTRE_ROW;


    const col =
        CENTRE_COL -
        Math.floor(
            word.length / 2
        );


    if (
        col < 0 ||
        col + word.length >
            BOARD_SIZE
    ) {

        console.error(
            "Starting word is too long:",
            word
        );

        return false;

    }


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


    return true;

}


/* --------------------------------
   GENERATE BOARD
-------------------------------- */

function generateBoard() {

    createEmptyBoard();

    placedWords = [];


    const firstWord =
        getStartingWord();


    if (!firstWord) {

        displayBoard();


        wordCountElement.textContent =
            "No starting word";


        wordListElement.innerHTML =
            "";


        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "dictionary.txt needs at least one word longer than 10 letters.";


        wordListElement.appendChild(
            message
        );


        return;

    }


    console.log(
        "Starting word:",
        firstWord
    );


    if (
        !placeFirstWord(
            firstWord
        )
    ) {

        return;

    }


    displayBoard();

    displayWords();


    let failedAttempts = 0;


    function addWord() {

        if (
            placedWords.length >=
            TARGET_WORD_COUNT
        ) {

            console.log(
                "Board complete!"
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


        if (
            failedAttempts >= 10
        ) {

            console.log(
                "No more legal words found."
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
                        word.length >= 2
                );


        dictionary =
            [
                ...new Set(dictionary)
            ];


        dictionarySet =
            new Set(dictionary);


        console.log(
            "Total dictionary words:",
            dictionary.length
        );


        const startingWords =
            dictionary.filter(
                word =>
                    word.length >=
                    STARTING_WORD_MIN_LENGTH
            );


        console.log(
            "Starting words available:",
            startingWords.length
        );


        const crosswordWords =
            dictionary.filter(
                word =>
                    word.length >= 3 &&
                    word.length <= 8
            );


        console.log(
            "Crossword words available:",
            crosswordWords.length
        );


        /*
           Confirm the Scrabble tile
           data is correct.
        */

        console.log(
            "Total Scrabble tiles:",
            getTotalTileCount()
        );


        /*
           Generate board.
        */

        generateBoard();

    }
    catch (error) {

        console.error(
            "Dictionary error:",
            error
        );


        createEmptyBoard();

        placedWords = [];


        displayBoard();


        wordCountElement.textContent =
            "Dictionary error";


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
