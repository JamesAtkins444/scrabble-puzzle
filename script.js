const BOARD_SIZE = 7;

const TARGET_WORD_COUNT =
    1 + Math.floor(Math.random() * 3);

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 5;

const STARTING_WORD_MIN_LENGTH = 5;
const STARTING_WORD_MAX_LENGTH = 6;

const PLAYER_TILE_COUNT = 7;


/* --------------------------------
   SCRABBLE BONUS SQUARES
-------------------------------- */

const BONUS_TYPES = {

    DOUBLE_LETTER: {
        label: "2x L",
        className: "double-letter"
    },

    TRIPLE_LETTER: {
        label: "3x L",
        className: "triple-letter"
    },

    DOUBLE_WORD: {
        label: "2x W",
        className: "double-word"
    },

    TRIPLE_WORD: {
        label: "3x W",
        className: "triple-word"
    }

};


/*
   7x7 Scrabble-style bonus layout.

   If a generated puzzle word occupies one
   of these positions, the bonus square is
   removed from that position.
*/

const BONUS_LAYOUT = [

    [
        "triple-word",
        null,
        "double-letter",
        null,
        "double-letter",
        null,
        "triple-word"
    ],

    [
        null,
        "double-word",
        null,
        "triple-letter",
        null,
        "double-word",
        null
    ],

    [
        "double-letter",
        null,
        "double-letter",
        null,
        "double-letter",
        null,
        "double-letter"
    ],

    [
        null,
        "triple-letter",
        null,
        "double-word",
        null,
        "triple-letter",
        null
    ],

    [
        "double-letter",
        null,
        "double-letter",
        null,
        "double-letter",
        null,
        "double-letter"
    ],

    [
        null,
        "double-word",
        null,
        "triple-letter",
        null,
        "double-word",
        null
    ],

    [
        "triple-word",
        null,
        "double-letter",
        null,
        "double-letter",
        null,
        "triple-word"
    ]

];


/* --------------------------------
   SCRABBLE TILE VALUES
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
   GAME VARIABLES
-------------------------------- */

let board = [];

let placedWords = [];

let dictionary = [];

let dictionarySet =
    new Set();

let playerTiles = [];

let playerPlacedTiles = [];

let selectedTileIndex = null;

let bonusSquares = {};


/* --------------------------------
   SCRABBLE SCORING
-------------------------------- */

function getLetterValue(letter) {

    const upperLetter =
        letter.toUpperCase();

    if (
        SCRABBLE_TILES[upperLetter]
    ) {

        return SCRABBLE_TILES[
            upperLetter
        ].value;

    }

    return 0;

}


function calculateWordScore(word) {

    let score = 0;

    for (
        const letter of word
    ) {

        score +=
            getLetterValue(letter);

    }

    return score;

}


/* --------------------------------
   CALCULATE SCORE WITH BONUS SQUARES
-------------------------------- */

function calculateWordScoreAtPosition(
    word,
    row,
    col,
    direction
) {

    let score = 0;

    let wordMultiplier = 1;

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

        let letterScore =
            getLetterValue(
                word[i]
            );

        const bonus =
            getBonusSquare(
                position.row,
                position.col
            );


        if (
            bonus === "double-letter"
        ) {

            letterScore *= 2;

        }

        else if (
            bonus === "triple-letter"
        ) {

            letterScore *= 3;

        }

        else if (
            bonus === "double-word"
        ) {

            wordMultiplier *= 2;

        }

        else if (
            bonus === "triple-word"
        ) {

            wordMultiplier *= 3;

        }


        score += letterScore;

    }


    return score * wordMultiplier;

}


/* --------------------------------
   CREATE EMPTY BOARD
-------------------------------- */

function createEmptyBoard() {

    board = [];

    bonusSquares = {};

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
   BONUS SQUARE HELPERS
-------------------------------- */

function getBonusSquare(
    row,
    col
) {

    return (
        bonusSquares[
            `${row},${col}`
        ] || null
    );

}


function generateBonusSquares() {

    bonusSquares = {};

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

            const bonusType =
                BONUS_LAYOUT[row][col];


            if (!bonusType) {

                continue;

            }


            /*
               Never put a bonus underneath
               an original puzzle tile.
            */

            if (
                board[row][col]
            ) {

                continue;

            }


            bonusSquares[
                `${row},${col}`
            ] = bonusType;

        }

    }

}


function getBonusLabel(
    bonusType
) {

    for (
        const key in BONUS_TYPES
    ) {

        if (
            BONUS_TYPES[key].className ===
            bonusType
        ) {

            return BONUS_TYPES[key].label;

        }

    }

    return "";

}


/* --------------------------------
   DISPLAY BOARD
-------------------------------- */

function displayBoard() {

    boardElement.innerHTML = "";

    const tileStatuses =
        getPlayerTileStatuses();


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


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            const bonusType =
                getBonusSquare(
                    row,
                    col
                );


            if (bonusType) {

                cell.classList.add(
                    bonusType
                );

            }


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

                const playerTile =
                    getPlayerPlacedTile(
                        row,
                        col
                    );


                if (playerTile) {

                    cell.classList.add(
                        "player-tile"
                    );


                    if (bonusType) {

                        const bonusBadge =
                            document.createElement(
                                "span"
                            );


                        bonusBadge.className =
                            "bonus-badge";


                        bonusBadge.textContent =
                            getBonusLabel(
                                bonusType
                            );


                        cell.appendChild(
                            bonusBadge
                        );

                    }


                    const status =
                        tileStatuses[
                            `${row},${col}`
                        ];


                    if (
                        status === "valid"
                    ) {

                        cell.classList.add(
                            "valid"
                        );

                    }

                    else if (
                        status === "invalid"
                    ) {

                        cell.classList.add(
                            "invalid"
                        );

                    }

                    else {

                        cell.classList.add(
                            "isolated"
                        );

                    }

                }

                else {

                    cell.classList.add(
                        "letter"
                    );

                }


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
                    getLetterValue(
                        letter
                    );


                cell.appendChild(
                    letterElement
                );

                cell.appendChild(
                    valueElement
                );

            }


            else if (bonusType) {

                const bonusLabel =
                    document.createElement(
                        "span"
                    );


                bonusLabel.className =
                    "bonus-label";


                bonusLabel.textContent =
                    getBonusLabel(
                        bonusType
                    );


                cell.appendChild(
                    bonusLabel
                );

            }


            boardElement.appendChild(
                cell
            );

        }

    }

}


/* --------------------------------
   FIND PLAYER TILE
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
   GET NEIGHBOURS
-------------------------------- */

function getNeighbours(
    row,
    col
) {

    return [

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

}


/* --------------------------------
   CHECK IF PLAYER TILE IS ISOLATED
-------------------------------- */

function isTileIsolated(
    row,
    col
) {

    for (
        const neighbour of
        getNeighbours(row, col)
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

            return false;

        }

    }


    return true;

}


/* --------------------------------
   READ WORD AT TILE
-------------------------------- */

function getWordAtTile(
    row,
    col,
    direction
) {

    return readWord(
        board,
        row,
        col,
        direction
    );

}


/* --------------------------------
   GET PLAYER TILE STATUS
-------------------------------- */

function getPlayerTileStatuses() {

    const statuses = {};

    const connectedToPuzzle =
        new Set();

    const queue = [];


    /*
       Find every original puzzle tile.
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
                board[row][col] &&
                !getPlayerPlacedTile(
                    row,
                    col
                )
            ) {

                const key =
                    `${row},${col}`;


                connectedToPuzzle.add(
                    key
                );


                queue.push({
                    row: row,
                    col: col
                });

            }

        }

    }


    /*
       Spread through all connected tiles.

       Original → Player → Player
       is considered connected.
    */

    while (
        queue.length > 0
    ) {

        const current =
            queue.shift();


        for (
            const neighbour of
            getNeighbours(
                current.row,
                current.col
            )
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
                !board[
                    neighbour.row
                ][
                    neighbour.col
                ]
            ) {

                continue;

            }


            const key =
                `${neighbour.row},${neighbour.col}`;


            if (
                connectedToPuzzle.has(
                    key
                )
            ) {

                continue;

            }


            connectedToPuzzle.add(
                key
            );


            queue.push({
                row: neighbour.row,
                col: neighbour.col
            });

        }

    }


    /*
       Evaluate each player tile.
    */

    playerPlacedTiles.forEach(
        tile => {

            const key =
                `${tile.row},${tile.col}`;


            const connected =
                connectedToPuzzle.has(
                    key
                );


            /*
               Disconnected tiles are invalid.

               A completely isolated tile remains
               yellow so the player knows it is
               currently unconnected.
            */

            if (!connected) {

                if (
                    isTileIsolated(
                        tile.row,
                        tile.col
                    )
                ) {

                    statuses[key] =
                        "isolated";

                }

                else {

                    statuses[key] =
                        "invalid";

                }

                return;

            }


            const horizontalWord =
                getWordAtTile(
                    tile.row,
                    tile.col,
                    "horizontal"
                );


            const verticalWord =
                getWordAtTile(
                    tile.row,
                    tile.col,
                    "vertical"
                );


            const hasHorizontalWord =
                horizontalWord.length >= 2;

            const hasVerticalWord =
                verticalWord.length >= 2;


            let hasInvalidWord =
                false;


            if (
                hasHorizontalWord &&
                !dictionarySet.has(
                    horizontalWord
                )
            ) {

                hasInvalidWord = true;

            }


            if (
                hasVerticalWord &&
                !dictionarySet.has(
                    verticalWord
                )
            ) {

                hasInvalidWord = true;

            }


            if (hasInvalidWord) {

                statuses[key] =
                    "invalid";

            }

            else if (
                hasHorizontalWord ||
                hasVerticalWord
            ) {

                statuses[key] =
                    "valid";

            }

            else {

                statuses[key] =
                    "invalid";

            }

        }
    );


    return statuses;

}


/* --------------------------------
   GET ALL BOARD WORDS WITH POSITIONS
-------------------------------- */

function getAllBoardWordsWithPositions(
    testBoard
) {

    const words = [];


    /* HORIZONTAL */

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
                col === 0 ||
                !testBoard[row][col - 1]
            ) {

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

                    words.push({

                        word: word,
                        row: row,
                        col: col,
                        direction:
                            "horizontal"

                    });

                }

            }

        }

    }


    /* VERTICAL */

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
                row === 0 ||
                !testBoard[row - 1][col]
            ) {

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

                    words.push({

                        word: word,
                        row: row,
                        col: col,
                        direction:
                            "vertical"

                    });

                }

            }

        }

    }


    return words;

}


/* --------------------------------
   DISPLAY WORDS
-------------------------------- */

function displayWords() {

    const words =
        getAllBoardWordsWithPositions(
            board
        );


    wordCountElement.textContent =
        `${words.length} words`;


    wordListElement.innerHTML =
        "";


    words.forEach(
        wordData => {

            const element =
                document.createElement(
                    "span"
                );


            element.className =
                "word";


            const score =
                calculateWordScoreAtPosition(
                    wordData.word,
                    wordData.row,
                    wordData.col,
                    wordData.direction
                );


            element.textContent =
                `${wordData.word} (${score})`;


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

    tileRackElement.innerHTML =
        "";


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
   CREATE RANDOM PLAYER TILE
-------------------------------- */

function createRandomTile() {

    const tileBag = [];


    for (
        const letter in
        SCRABBLE_TILES
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


    displayBoard();

}


/* --------------------------------
   SELECT PLAYER TILE
-------------------------------- */

function selectPlayerTile(
    index
) {

    if (
        selectedTileIndex ===
        index
    ) {

        selectedTileIndex =
            null;

    }

    else {

        selectedTileIndex =
            index;

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
   RETURN PLAYER TILE TO RACK
-------------------------------- */

function returnPlayerTileToRack(
    row,
    col
) {

    const tileIndex =
        playerPlacedTiles.findIndex(
            tile =>
                tile.row === row &&
                tile.col === col
        );


    if (
        tileIndex === -1
    ) {

        return false;

    }


    const tile =
        playerPlacedTiles[
            tileIndex
        ];


    playerTiles.push({

        letter:
            tile.letter,

        value:
            tile.value

    });


    board[row][col] =
        null;


    playerPlacedTiles.splice(
        tileIndex,
        1
    );


    selectedTileIndex =
        null;


    displayBoard();

    displayPlayerTiles();

    displayWords();


    showTileMessage(
        `${tile.letter} returned to your rack.`,
        ""
    );


    return true;

}


/* --------------------------------
   SHOW PLAYER MESSAGE
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
   CHECK BOARD POSITION
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
   READ A WORD
-------------------------------- */

function readWord(
    testBoard,
    row,
    col,
    direction
) {

    let startRow =
        row;

    let startCol =
        col;


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
   GET ALL WORDS ON BOARD
-------------------------------- */

function getAllBoardWords(
    testBoard
) {

    const words = [];


    /* HORIZONTAL */

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

                words.push(
                    word
                );

            }

        }

    }


    /* VERTICAL */

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

                words.push(
                    word
                );

            }

        }

    }


    return words;

}


/* --------------------------------
   CHECK WHETHER BOARD IS VALID
-------------------------------- */

function isBoardValid(
    testBoard
) {

    const words =
        getAllBoardWords(
            testBoard
        );


    if (
        words.length === 0
    ) {

        return true;

    }


    for (
        const word of words
    ) {

        if (
            !dictionarySet.has(
                word
            )
        ) {

            return false;

        }

    }


    return true;

}


/* --------------------------------
   PLAYER BOARD CLICK
-------------------------------- */

function handleBoardClick(
    row,
    col
) {

    const playerTile =
        getPlayerPlacedTile(
            row,
            col
        );


    /*
       Clicking an existing player tile
       returns it to the rack.
    */

    if (playerTile) {

        returnPlayerTileToRack(
            row,
            col
        );

        return;

    }


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
       Original puzzle tiles cannot
       be overwritten.
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


    board[row][col] =
        selectedTile.letter;


    playerPlacedTiles.push({

        letter:
            selectedTile.letter,

        value:
            selectedTile.value,

        row: row,

        col: col

    });


    playerTiles.splice(
        selectedTileIndex,
        1
    );


    selectedTileIndex =
        null;


    displayBoard();

    displayPlayerTiles();

    displayWords();


    const tileStatuses =
        getPlayerTileStatuses();


    const placedTileStatus =
        tileStatuses[
            `${row},${col}`
        ];


    if (
        placedTileStatus ===
        "valid"
    ) {

        showTileMessage(
            "Valid word!",
            "success"
        );

    }

    else if (
        placedTileStatus ===
        "invalid"
    ) {

        showTileMessage(
            "This tile is part of an invalid word.",
            "error"
        );

    }

    else {

        showTileMessage(
            "This tile is currently isolated.",
            ""
        );

    }

}


/* --------------------------------
   GET ALL EXISTING LETTERS
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

            col:
                col + index

        };

    }


    return {

        row:
            row + index,

        col: col

    };

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
   GET EXISTING WORD DIRECTION
-------------------------------- */

function getExistingWordDirection(
    row,
    col
) {

    for (
        const wordData of
        placedWords
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
   TRY TO PLACE WORD
-------------------------------- */

function tryPlaceWord(
    word,
    row,
    col,
    direction
) {

    if (
        word.length < MIN_WORD_LENGTH ||
        word.length > MAX_WORD_LENGTH
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
                existing !==
                word[i]
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
        board.map(
            row => [...row]
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

        direction:
            direction

    });


    return true;

}


/* --------------------------------
   SHUFFLE ARRAY
-------------------------------- */

function shuffle(array) {

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
        const existing of
        existingLetters
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
            const word of
            shuffledCandidates
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


                const newDirection =
                    existingDirection ===
                    "horizontal"
                        ? "vertical"
                        : "horizontal";


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

    generatePlayerTiles();


    let failedAttempts = 0;


    function addWord() {

        if (
            placedWords.length >=
            TARGET_WORD_COUNT + 1
        ) {

            /*
               Generate bonuses only AFTER
               all puzzle words have been placed.
            */

            generateBonusSquares();

            displayBoard();

            displayWords();

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

            generateBonusSquares();

            displayBoard();

            displayWords();

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

    console.log(
        "Starting dictionary load..."
    );


    try {

        const dictionaryURL =
            new URL(
                "dictionary.txt",
                window.location.href
            ).href;


        console.log(
            "Loading dictionary from:",
            dictionaryURL
        );


        const response =
            await fetch(
                dictionaryURL,
                {
                    cache: "no-store"
                }
            );


        console.log(
            "Dictionary response:",
            response.status,
            response.statusText
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} ${response.statusText}`
            );

        }


        const text =
            await response.text();


        console.log(
            "Dictionary file loaded."
        );


        console.log(
            "Characters loaded:",
            text.length
        );


        if (!text.trim()) {

            throw new Error(
                "dictionary.txt is empty"
            );

        }


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


        if (
            dictionary.length === 0
        ) {

            throw new Error(
                "No usable words were found in dictionary.txt"
            );

        }


        console.log(
            "Dictionary loaded successfully."
        );


        generateBoard();

    }

    catch (error) {

        console.error(
            "DICTIONARY ERROR:",
            error
        );


        createEmptyBoard();

        placedWords = [];


        displayBoard();


        wordCountElement.textContent =
            "Dictionary error";


        wordListElement.textContent =
            `Could not load dictionary.txt — ${error.message}`;

    }

}


/* --------------------------------
   BUTTON EVENTS
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
   START GAME
-------------------------------- */

loadDictionary();
