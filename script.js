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
   The player's seven tiles.

   Each entry looks like:

   {
       letter: "A",
       value: 1
   }
*/
let playerTiles = [];


/*
   Index of the currently
   selected player tile.

   null means nothing selected.
*/
let selectedTileIndex = null;


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
               Remember the position
               of this board cell.
            */

            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            /*
               Clicking an empty
               cell attempts to place
               the selected tile.
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

                cell.classList.add(
                    "letter"
                );


                const letterElement =
                    document.createElement(
                        "span"
                    );

                letterElement.className =
                    "tile-letter";

                letterElement.textContent =
                    letter;


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
                `${wordData.word} (${calculateWordScore(wordData.word)})`;


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


            /*
               Highlight the currently
               selected tile.
            */

            if (
                index ===
                selectedTileIndex
            ) {

                element.classList.add(
                    "selected"
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
                tile.letter;


            /*
               Small Scrabble value.
            */

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


            /*
               Selecting a tile.
            */

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

    /*
       Create a complete list of
       the 100 standard Scrabble
       tiles.

       This means common letters
       appear more frequently than
       rare letters.
    */

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
                value: tileData.value
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
        "Select a tile, then click an empty square.",
        ""
    );

}


/* --------------------------------
   SELECT PLAYER TILE
-------------------------------- */

function selectPlayerTile(
    index
) {

    /*
       If the player clicks the
       currently selected tile,
       deselect it.
    */

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
            `Selected ${tile.letter}. Click an empty board square.`,
            ""
        );

    }
    else {

        showTileMessage(
            "Select a tile, then click an empty square.",
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
   PUT WORD ON BOARD
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
       Move backwards until we
       reach the beginning of
       the word.
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
       Now read the entire
       word forwards.
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
       Horizontal words.
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
       Vertical words.
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
   CHECK IF PLACEMENT CONNECTS
-------------------------------- */

function placementConnects(
    row,
    col
) {

    const neighbours = [

        {
            row: row - 1,
            col: col
        },

        {
            row: row + 1,
            col: col
        },

        {
            row: row,
            col: col - 1
        },

        {
            row: row,
            col: col + 1
        }

    ];


    for (
        const neighbour
        of neighbours
    ) {

        if (
            isInsideBoard(
                neighbour.row,
                neighbour.col
            ) &&
            board[
                neighbour.row
            ][
                neighbour.col
            ]
        ) {

            return true;

        }

    }


    return false;

}


/* --------------------------------
   TRY PLACE PLAYER TILE
-------------------------------- */

function tryPlacePlayerTile(
    letter,
    row,
    col
) {

    /*
       The square must be inside
       the board.
    */

    if (
        !isInsideBoard(
            row,
            col
        )
    ) {

        return false;

    }


    /*
       The square must be empty.
    */

    if (
        board[row][col]
    ) {

        return false;

    }


    /*
       A player's first tile must
       connect to the existing
       board.
    */

    if (
        getExistingLetters().length > 0 &&
        !placementConnects(
            row,
            col
        )
    ) {

        return false;

    }


    /*
       Create a temporary version
       of the board.
    */

    const testBoard =
        copyBoard();


    testBoard[row][col] =
        letter;


    /*
       The resulting board must
       contain only valid words.
    */

    if (
        !isBoardValid(
            testBoard
        )
    ) {

        return false;

    }


    /*
       Placement is valid.
    */

    board =
        testBoard;


    return true;

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
       Cannot place onto an
       existing tile.
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
       Try placing the tile.
    */

    const success =
        tryPlacePlayerTile(
            selectedTile.letter,
            row,
            col
        );


    if (!success) {

        showTileMessage(
            "That tile cannot be placed there.",
            "error"
        );

        return;

    }


    /*
       Remove the tile from
       the player's rack.
    */

    playerTiles.splice(
        selectedTileIndex,
        1
    );


    selectedTileIndex = null;


    /*
       Refresh the board.
    */

    displayBoard();

    displayPlayerTiles();

    displayWords();


    showTileMessage(
        "Tile placed successfully.",
        "success"
    );

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
            "dictionary.txt needs at least one word between 5 and 6 letters long.";

        wordListElement.appendChild(
            message
        );

        return;

    }


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
       Give the player a fresh
       rack whenever a new board
       is generated.
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
   GENERATE BOARD BUTTON
-------------------------------- */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* --------------------------------
   NEW PLAYER TILES BUTTON
-------------------------------- */

newTilesButton.addEventListener(
    "click",
    function () {

        generatePlayerTiles();

    }
);


/* --------------------------------
   START
-------------------------------- */

loadDictionary();
