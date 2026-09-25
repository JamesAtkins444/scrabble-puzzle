const BOARD_SIZE = 15;

const CENTRE_ROW = 7;
const CENTRE_COL = 7;

const TARGET_WORD_COUNT = 12;

/*
   Generated crossword words
   must be 3-8 letters long.
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

        /*
           Every 2+ letter sequence
           must exist in dictionary.
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
   COUNT NEW TILES
-------------------------------- */

function countNewTiles(
    word,
    row,
    col,
    direction
) {

    let count = 0;


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
            !board[
                position.row
            ][
                position.col
            ]
        ) {

            count++;

        }

    }


    return count;

}


/* --------------------------------
   COUNT OVERLAPS
-------------------------------- */

function countOverlaps(
    word,
    row,
    col,
    direction
) {

    let count = 0;


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
            board[
                position.row
            ][
                position.col
            ]
        ) {

            count++;

        }

    }


    return count;

}


/* --------------------------------
   DISTANCE FROM CENTRE
-------------------------------- */

function distanceFromCentre(
    row,
    col,
    word,
    direction
) {

    const centreIndex =
        Math.floor(
            word.length / 2
        );


    const centrePosition =
        getPosition(
            row,
            col,
            direction,
            centreIndex
        );


    const rowDistance =
        Math.abs(
            centrePosition.row -
            CENTRE_ROW
        );


    const colDistance =
        Math.abs(
            centrePosition.col -
            CENTRE_COL
        );


    return (
        rowDistance +
        colDistance
    );

}


/* --------------------------------
   COUNT NEARBY LETTERS
-------------------------------- */

function countNearbyLetters(
    row,
    col,
    word,
    direction
) {

    let count = 0;


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
               Don't count the word's
               own letters.
            */

            if (
                getPosition(
                    row,
                    col,
                    direction,
                    i
                ).row ===
                    neighbour.row &&
                getPosition(
                    row,
                    col,
                    direction,
                    i
                ).col ===
                    neighbour.col
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

                count++;

            }

        }

    }


    return count;

}


/* --------------------------------
   COUNT BOARD TILES
-------------------------------- */

function countBoardTiles() {

    let count = 0;


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

                count++;

            }

        }

    }


    return count;

}


/* --------------------------------
   GET BOARD BOUNDS
-------------------------------- */

function getBoardBounds() {

    let minRow = BOARD_SIZE;
    let maxRow = -1;
    let minCol = BOARD_SIZE;
    let maxCol = -1;


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

                minRow =
                    Math.min(
                        minRow,
                        row
                    );

                maxRow =
                    Math.max(
                        maxRow,
                        row
                    );

                minCol =
                    Math.min(
                        minCol,
                        col
                    );

                maxCol =
                    Math.max(
                        maxCol,
                        col
                    );

            }

        }

    }


    return {

        minRow,
        maxRow,
        minCol,
        maxCol

    };

}


/* --------------------------------
   CALCULATE PLACEMENT SCORE
-------------------------------- */

function scorePlacement(
    word,
    row,
    col,
    direction,
    testBoard
) {

    let score = 0;


    /*
       --------------------------------
       1. REWARD MULTIPLE OVERLAPS
       --------------------------------

       Real Scrabble positions often
       have words interacting with
       existing words.
    */

    const overlaps =
        countOverlaps(
            word,
            row,
            col,
            direction
        );


    score +=
        overlaps * 40;


    /*
       --------------------------------
       2. REWARD CROSSING WITH
          EXACTLY ONE MAIN LETTER
       --------------------------------

       One-letter crossings tend to
       look more natural than simply
       laying one word almost entirely
       over another.
    */

    if (
        overlaps === 1
    ) {

        score += 35;

    }


    /*
       --------------------------------
       3. PENALISE TOO MANY OVERLAPS
       --------------------------------

       If a new word overlaps many
       letters it can start looking
       artificial.
    */

    if (
        overlaps >= 3
    ) {

        score -=
            (overlaps - 2) * 20;

    }


    /*
       --------------------------------
       4. REWARD NEW TILES
       --------------------------------

       We want the board to grow.
    */

    const newTiles =
        countNewTiles(
            word,
            row,
            col,
            direction
        );


    score +=
        newTiles * 8;


    /*
       --------------------------------
       5. KEEP BOARD AROUND CENTRE
       --------------------------------
    */

    const centreDistance =
        distanceFromCentre(
            row,
            col,
            word,
            direction
        );


    score -=
        centreDistance * 3;


    /*
       --------------------------------
       6. REWARD NATURAL LOCAL
          CONNECTIONS
       --------------------------------
    */

    const nearbyLetters =
        countNearbyLetters(
            row,
            col,
            word,
            direction
        );


    score +=
        nearbyLetters * 5;


    /*
       --------------------------------
       7. LOOK AT RESULTING WORDS
       --------------------------------
    */

    const resultingWords =
        getAllBoardWords(
            testBoard
        );


    /*
       Reward positions that create
       multiple words.
    */

    score +=
        resultingWords.length * 15;


    /*
       --------------------------------
       8. BALANCE DIRECTIONS
       --------------------------------
    */

    let horizontalCount = 0;
    let verticalCount = 0;


    for (
        const placed
        of placedWords
    ) {

        if (
            placed.direction ===
            "horizontal"
        ) {

            horizontalCount++;

        }
        else {

            verticalCount++;

        }

    }


    if (
        direction ===
        "horizontal"
    ) {

        if (
            horizontalCount >
            verticalCount + 1
        ) {

            score -= 35;

        }

    }
    else {

        if (
            verticalCount >
            horizontalCount + 1
        ) {

            score -= 35;

        }

    }


    /*
       --------------------------------
       9. ENCOURAGE BOARD SPREAD
       --------------------------------
    */

    const bounds =
        getBoardBounds();


    const newMinRow =
        Math.min(
            bounds.minRow,
            row
        );


    const newMaxRow =
        Math.max(
            bounds.maxRow,
            direction === "vertical"
                ? row + word.length - 1
                : row
        );


    const newMinCol =
        Math.min(
            bounds.minCol,
            col
        );


    const newMaxCol =
        Math.max(
            bounds.maxCol,
            direction === "horizontal"
                ? col + word.length - 1
                : col
        );


    const boardWidth =
        newMaxCol -
        newMinCol +
        1;


    const boardHeight =
        newMaxRow -
        newMinRow +
        1;


    /*
       Reward gradual expansion
       rather than staying in one
       tiny cluster.
    */

    score +=
        (boardWidth + boardHeight) *
        2;


    /*
       --------------------------------
       10. SMALL RANDOM FACTOR
       --------------------------------

       Prevent every generated board
       from looking identical.
    */

    score +=
        Math.random() * 20;


    return score;

}


/* --------------------------------
   FIND ALL POSSIBLE PLACEMENTS
-------------------------------- */

function findPossiblePlacements() {

    const placements = [];

    const existingLetters =
        getExistingLetters();


    /*
       Look at every existing letter.
    */

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


        /*
           Try every candidate.
        */

        for (
            const word
            of candidates
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
                   Find direction of
                   existing word.
                */

                const existingDirection =
                    getExistingWordDirection(
                        existing.row,
                        existing.col
                    );


                if (
                    !existingDirection
                ) {

                    continue;

                }


                /*
                   New word must cross
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
                   Check whether the
                   placement fits.
                */

                if (
                    !isInsideBoard(
                        newRow,
                        newCol
                    )
                ) {

                    continue;

                }


                if (
                    newDirection ===
                    "horizontal"
                ) {

                    if (
                        newCol +
                        word.length >
                        BOARD_SIZE
                    ) {

                        continue;

                    }

                }
                else {

                    if (
                        newRow +
                        word.length >
                        BOARD_SIZE
                    ) {

                        continue;

                    }

                }


                /*
                   Check for conflicts
                   with existing letters.
                */

                let valid =
                    true;

                let overlaps = 0;


                for (
                    let j = 0;
                    j < word.length;
                    j++
                ) {

                    const position =
                        getPosition(
                            newRow,
                            newCol,
                            newDirection,
                            j
                        );


                    const existingLetter =
                        board[
                            position.row
                        ][
                            position.col
                        ];


                    if (
                        existingLetter
                    ) {

                        if (
                            existingLetter !==
                            word[j]
                        ) {

                            valid = false;

                            break;

                        }


                        overlaps++;

                    }

                }


                if (!valid) {

                    continue;

                }


                /*
                   Must actually cross
                   the existing board.
                */

                if (
                    overlaps === 0
                ) {

                    continue;

                }


                /*
                   Must add at least one
                   new tile.
                */

                const newTiles =
                    countNewTiles(
                        word,
                        newRow,
                        newCol,
                        newDirection
                    );


                if (
                    newTiles === 0
                ) {

                    continue;

                }


                /*
                   Create test board.
                */

                const testBoard =
                    copyBoard();


                putWord(
                    testBoard,
                    word,
                    newRow,
                    newCol,
                    newDirection
                );


                /*
                   Entire board must
                   remain valid.
                */

                if (
                    !isBoardValid(
                        testBoard
                    )
                ) {

                    continue;

                }


                /*
                   Calculate quality
                   score.
                */

                const score =
                    scorePlacement(
                        word,
                        newRow,
                        newCol,
                        newDirection,
                        testBoard
                    );


                placements.push({

                    word: word,

                    row: newRow,

                    col: newCol,

                    direction:
                        newDirection,

                    score: score

                });

            }

        }

    }


    return placements;

}


/* --------------------------------
   CHOOSE BEST PLACEMENT
-------------------------------- */

function findBestPlacement() {

    const placements =
        findPossiblePlacements();


    if (
        placements.length === 0
    ) {

        return null;

    }


    /*
       Sort from highest score
       to lowest score.
    */

    placements.sort(
        (a, b) =>
            b.score -
            a.score
    );


    /*
       Don't always pick the exact
       highest score.

       Pick randomly from the top
       few placements.

       This gives us different
       looking boards.
    */

    const topCount =
        Math.min(
            5,
            placements.length
        );


    const selectedIndex =
        Math.floor(
            Math.random() *
            topCount
        );


    const selected =
        placements[
            selectedIndex
        ];


    console.log(
        "Selected placement:",
        selected.word,
        "score:",
        Math.round(
            selected.score
        )
    );


    return selected;

}


/* --------------------------------
   PLACE WORD
-------------------------------- */

function placeSelectedWord(
    placement
) {

    const testBoard =
        copyBoard();


    putWord(
        testBoard,
        placement.word,
        placement.row,
        placement.col,
        placement.direction
    );


    board =
        testBoard;


    placedWords.push({

        word:
            placement.word,

        row:
            placement.row,

        col:
            placement.col,

        direction:
            placement.direction

    });

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

            console.log(
                "Final board words:",
                placedWords
            );

            return;

        }


        /*
           Find the best available
           placement.
        */

        const placement =
            findBestPlacement();


        if (placement) {

            failedAttempts = 0;


            placeSelectedWord(
                placement
            );


            displayBoard();

            displayWords();

        }
        else {

            failedAttempts++;

        }


        /*
           Stop if no more legal
           placements can be found.
        */

        if (
            failedAttempts >= 10
        ) {

            console.log(
                "No more legal placements found."
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
            50
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

           We don't limit the length
           because the starting word
           can be longer than 8 letters.
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
           Starting words.
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
           Generated crossword words.

           2-letter words are deliberately
           excluded from generation.
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
