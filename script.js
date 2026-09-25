const BOARD_SIZE = 7;


/*
   Generate a random number of
   additional crossword words.

   Minimum: 2
   Maximum: 4
*/
const TARGET_WORD_COUNT =
    1 + Math.floor(Math.random() * 3);


/*
   Crossword words must be
   3-5 letters long.
*/
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 5;


/*
   Starting word must be
   5-6 letters long.
*/
const STARTING_WORD_MIN_LENGTH = 5;
const STARTING_WORD_MAX_LENGTH = 6;


/*
   Player always receives
   seven Scrabble tiles.
*/
const PLAYER_TILE_COUNT = 7;


/* --------------------------------
   SCRABBLE TILE DATA
-------------------------------- */

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

const tileRackElement =
    document.getElementById("tileRack");

const newTilesButton =
    document.getElementById("newTilesButton");

const tileMessageElement =
    document.getElementById("tileMessage");


/* --------------------------------
   GAME DATA
-------------------------------- */

let board = [];

let placedWords = [];

let dictionary = [];

let dictionarySet = new Set();


/*
   Player tiles still sitting
   in the rack.
*/
let playerTiles = [];


/*
   Player tiles currently
   placed on the board.

   Each entry looks like:

   {
       letter: "A",
       value: 1,
       row: 2,
       col: 4
   }
*/
let playerPlacedTiles = [];


/*
   Index of selected rack tile.
*/
let selectedTileIndex = null;


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


    /*
       Check the validity of the
       current player position.

       This is calculated once
       for the whole board.
    */

    const boardIsValid =
        isBoardValid(board);


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


            /*
               Remember position.
            */

            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            /*
               Clicking an empty
               square places the
               selected tile.
            */

            cell.addEventListener(
                "click",
                function () {

                    handleBoardClick(
                        row,
                        col
                    );

                }
            );


            const letter =
                board[row][col];


            if (letter) {

                /*
                   Check whether this
                   tile belongs to the
                   player.
                */

                const playerTile =
                    getPlayerPlacedTile(
                        row,
                        col
                    );


                if (playerTile) {

                    cell.classList.add(
                        "player-tile"
                    );


                    if (
                        boardIsValid
                    ) {

                        cell.classList.add(
                            "valid"
                        );

                    }
                    else {

                        cell.classList.add(
                            "invalid"
                        );

                    }

                }
                else {

                    cell.classList.add(
                        "letter"
                    );

                }


                /*
                   Main letter.
                */

                const letterElement =
                    document.createElement(
                        "span"
                    );

                letterElement.className =
                    "tile-letter";

                letterElement.textContent =
                    letter;


                /*
                   Scrabble value.
                */

                const valueElement =
                    document.createElement(
                        "span"
                    );

                valueElement.className =
                    "tile-value";

                valueElement.textContent =
                    getLetterValue(letter);


                cell.appendChild(
                    letterElement
                );

                cell.appendChild(
                    valueElement
                );

            }


            boardElement.appendChild(
                cell
            );

        }

    }

}


/* --------------------------------
   GET PLAYER TILE AT POSITION
-------------------------------- */

function getPlayerPlacedTile(
    row,
    col
) {

    return playerPlacedTiles.find(
        tile =>
            tile.row === row &&
            tile.col === col
    );

}


/* --------------------------------
   DISPLAY WORDS
-------------------------------- */

function displayWords() {

    const words =
        getAllBoardWords(board);


    wordCountElement.textContent =
        `${words.length} words`;


    wordListElement.innerHTML = "";


    words.forEach(
        word => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "word";


            element.textContent =
                `${word} (${calculateWordScore(word)})`;


            wordListElement.appendChild(
                element
            );

        }
    );

}


/* --------------------------------
   DISPLAY PLAYER TILES
-------------------------------- */

function displayPlayerTiles() {

    tileRackElement.innerHTML = "";


    playerTiles.forEach(
        (tile, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "player-tile";


            if (
                index ===
                selectedTileIndex
            ) {

                element.classList.add(
                    "selected"
                );

            }


            const letterElement =
                document.createElement(
                    "span"
                );

            letterElement.className =
                "tile-letter";

            letterElement.textContent =
                tile.letter;


            const valueElement =
                document.createElement(
                    "span"
                );

            valueElement.className =
                "tile-value";

            valueElement.textContent =
                tile.value;


            element.appendChild(
                letterElement
            );

            element.appendChild(
                valueElement
            );


            element.addEventListener(
                "click",
                function () {

                    selectPlayerTile(
                        index
                    );

                }
            );


            tileRackElement.appendChild(
                element
            );

        }
    );

}


/* --------------------------------
   CREATE RANDOM TILE
-------------------------------- */

function createRandomTile() {

    const tileBag = [];


    for (
        const letter in SCRABBLE_TILES
    ) {

        const tileData =
            SCRABBLE_TILES[
                letter
            ];


        for (
            let i = 0;
            i < tileData.count;
            i++
        ) {

            tileBag.push({

                letter: letter,

                value:
                    tileData.value

            });

        }

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            tileBag.length
        );


    return tileBag[
        randomIndex
    ];

}


/* --------------------------------
   GENERATE PLAYER TILES
-------------------------------- */

function generatePlayerTiles() {

    playerTiles = [];

    playerPlacedTiles = [];

    selectedTileIndex = null;


    for (
        let i = 0;
        i < PLAYER_TILE_COUNT;
        i++
    ) {

        playerTiles.push(
            createRandomTile()
        );

    }


    displayPlayerTiles();


    showTileMessage(
        "Select a tile, then click anywhere on the board.",
        ""
    );

}


/* --------------------------------
   SELECT PLAYER TILE
-------------------------------- */

function selectPlayerTile(
    index
) {

    if (
        selectedTileIndex === index
    ) {

        selectedTileIndex = null;

    }
    else {

        selectedTileIndex = index;

    }


    displayPlayerTiles();


    if (
        selectedTileIndex !== null
    ) {

        const tile =
            playerTiles[
                selectedTileIndex
            ];


        showTileMessage(
            `Selected ${tile.letter}. Click anywhere on the board.`,
            ""
        );

    }
    else {

        showTileMessage(
            "Select a tile, then click anywhere on the board.",
            ""
        );

    }

}


/* --------------------------------
   TILE MESSAGE
-------------------------------- */

function showTileMessage(
    message,
    type
) {

    tileMessageElement.textContent =
        message;


    tileMessageElement.className =
        "tile-message";


    if (type) {

        tileMessageElement.classList.add(
            type
        );

    }

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
   COPY BOARD
-------------------------------- */

function copyBoard() {

    return board.map(
        row => [...row]
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
       Horizontal.
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
       Vertical.
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


    /*
       Empty board is valid.
    */

    if (
        words.length === 0
    ) {

        return true;

    }


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
   CHECK BOARD AFTER PLAYER MOVE
-------------------------------- */

function updatePlayerTileValidity() {

    /*
       Check the entire board.

       If every word is valid,
       all player tiles become
       green.

       If any word is invalid,
       all player tiles currently
       on the board become red.
    */

    const valid =
        isBoardValid(board);


    /*
       Update message.
    */

    if (valid) {

        showTileMessage(
            "Valid board!",
            "success"
        );

    }
    else {

        showTileMessage(
            "The board contains an invalid word.",
            "error"
        );

    }


    return valid;

}


/* --------------------------------
   HANDLE BOARD CLICK
-------------------------------- */

function handleBoardClick(
    row,
    col
) {

    /*
       Nothing selected.
    */

    if (
        selectedTileIndex === null
    ) {

        showTileMessage(
            "Select a tile first.",
            "error"
        );

        return;

    }


    /*
       Cannot place on an occupied
       square.
    */

    if (
        board[row][col]
    ) {

        showTileMessage(
            "That square is already occupied.",
            "error"
        );

        return;

    }


    const selectedTile =
        playerTiles[
            selectedTileIndex
        ];


    /*
       Place the tile.

       We deliberately DO NOT
       reject the placement if
       the resulting board is
       invalid.
    */

    board[row][col] =
        selectedTile.letter;


    /*
       Remember that this tile
       belongs to the player.
    */

    playerPlacedTiles.push({

        letter:
            selectedTile.letter,

        value:
            selectedTile.value,

        row: row,

        col: col

    });


    /*
       Remove it from the rack.
    */

    playerTiles.splice(
        selectedTileIndex,
        1
    );


    selectedTileIndex = null;


    /*
       Re-render the board.

       displayBoard() checks
       whether the current board
       is valid and colours the
       player's tiles accordingly.
    */

    displayBoard();

    displayPlayerTiles();

    displayWords();


    updatePlayerTileValidity();

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
   TRY PLACE GENERATED WORD
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
                    STARTING_WORD_MIN_LENGTH &&
                word.length <=
                    STARTING_WORD_MAX_LENGTH
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

    const directions = [

        "horizontal",

        "vertical"

    ];


    const direction =
        directions[
            Math.floor(
                Math.random() *
                directions.length
            )
        ];


    let maxRow =
        BOARD_SIZE - 1;

    let maxCol =
        BOARD_SIZE - 1;


    if (
        direction ===
        "vertical"
    ) {

        maxRow =
            BOARD_SIZE -
            word.length;

    }
    else {

        maxCol =
            BOARD_SIZE -
            word.length;

    }


    const row =
        Math.floor(
            Math.random() *
            (maxRow + 1)
        );


    const col =
        Math.floor(
            Math.random() *
            (maxCol + 1)
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

        direction:
            direction

    });


    return true;

}


/* --------------------------------
   GENERATE BOARD
-------------------------------- */

function generateBoard() {

    createEmptyBoard();

    placedWords = [];

    playerPlacedTiles = [];


    const firstWord =
        getStartingWord();


    if (!firstWord) {

        displayBoard();

        wordCountElement.textContent =
            "No starting word";

        wordListElement.innerHTML =
            "";

        return;

    }


    placeFirstWord(
        firstWord
    );


    displayBoard();

    displayWords();


    /*
       Give player seven fresh
       tiles.
    */

    generatePlayerTiles();


    let failedAttempts = 0;


    function addWord() {

        if (
            placedWords.length >=
            TARGET_WORD_COUNT + 1
        ) {

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


        console.log(
            "Total Scrabble tiles:",
            getTotalTileCount()
        );


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
   BUTTONS
-------------------------------- */

generateButton.addEventListener(
    "click",
    generateBoard
);


newTilesButton.addEventListener(
    "click",
    generatePlayerTiles
);


/* --------------------------------
   START
-------------------------------- */

loadDictionary();
