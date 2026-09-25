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


            element.textContent =
                wordData.word;


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


    /*
       Move backwards to find
       the beginning.
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
               Only process the first
               letter of a sequence.
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


            /*
               Only process the first
               letter of a sequence.
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

        /*
           Every connected sequence
           must exist in dictionary.txt.
        */

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

    /*
       Crossword words must be
       3-8 letters long.
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
       Must exist in dictionary.
    */

    if (
        !dictionarySet.has(word)
    ) {

        return false;

    }


    let overlaps = false;

    let addsNewTile = false;


    /*
       Check every letter.
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


        /*
           Must remain on board.
        */

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


        /*
           Existing letter must match.
        */

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
       Must cross an existing letter.
    */

    if (!overlaps) {

        return false;

    }


    /*
       Must add a new tile.
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
       Check entire board.
    */

    if (
        !isBoardValid(
            testBoard
        )
    ) {

        return false;

    }


    /*
       Success.
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


    /*
       Try each existing letter.
    */

    for (
        const existing
        of existingLetters
    ) {

        /*
           Only consider words
           between 3 and 8 letters.
        */

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


        /*
           Try each candidate.
        */

        for (
            const word
            of shuffledCandidates
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
                   Find the direction
                   of the existing word.
                */

                const existingDirection =
                    getExistingWordDirection(
                        existing.row,
                        existing.col
                    );


                /*
                   New word crosses
                   perpendicular to it.
                */

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


                /*
                   Calculate starting
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


                /*
                   Try placement.
                */

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

    /*
       Starting words must be
       at least 11 letters.
    */

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


    /*
       Pick random starting word.
    */

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


    /*
       Centre word around
       the middle of board.
    */

    const col =
        CENTRE_COL -
        Math.floor(
            word.length / 2
        );


    /*
       Make sure word fits.
    */

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


    /*
       Place letters.
    */

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        board[row][col + i] =
            word[i];

    }


    /*
       Record word.
    */

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


    /*
       Get random starting word.
    */

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


    /*
       Place starting word.
    */

    if (
        !placeFirstWord(
            firstWord
        )
    ) {

        return;

    }


    displayBoard();

    displayWords();


    /*
       --------------------------------
       ADD CROSSWORDS
       --------------------------------
    */

    let failedAttempts = 0;


    function addWord() {

        /*
           Stop when target reached.
        */

        if (
            placedWords.length >=
            TARGET_WORD_COUNT
        ) {

            console.log(
                "Board complete!"
            );

            return;

        }


        /*
           Find a crossing word.
        */

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
           Stop if no more legal
           words can be found.
        */

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


        /*
           Continue asynchronously.
        */

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


        /*
           Load every dictionary word.

           We don't limit the length here
           because the starting word can
           be longer than 8 letters.
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
                        word.length >= 2
                );


        /*
           Remove duplicates.
        */

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


        /*
           Show available starting words.
        */

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


        /*
           Show available crossword
           words.

           This should NOT include
           2-letter words.
        */

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
