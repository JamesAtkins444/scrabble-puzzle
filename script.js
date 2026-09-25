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

const MIN_WORD_LENGTH = 3;

const MAX_WORD_LENGTH = 8;

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

    for (
        const letter in SCRABBLE_TILES
    ) {

        total +=
            SCRABBLE_TILES[letter].count;

    }

    return total;

}


function getLetterValue(letter) {

    const upperLetter =
        letter.toUpperCase();

    if (
        SCRABBLE_TILES[upperLetter]
    ) {

        return SCRABBLE_TILES[upperLetter].value;

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


/* =========================================
   HTML ELEMENTS
   ========================================= */

const boardElement =
    document.getElementById("board");

const generateButton =
    document.getElementById(
        "generateButton"
    );

const wordCountElement =
    document.getElementById(
        "wordCount"
    );

const wordListElement =
    document.getElementById(
        "wordList"
    );


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

function getPosition(row, col) {

    if (
        !isInsideBoard(row, col)
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

function putWord(
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

        let currentRow = row;

        let currentCol = col;


        if (
            direction === "horizontal"
        ) {

            currentCol += i;

        } else {

            currentRow += i;

        }


        board[currentRow][currentCol] =
            word[i];

    }

}


/* =========================================
   READ WORD
   ========================================= */

function readWord(
    row,
    col,
    direction
) {

    let word = "";

    let currentRow = row;

    let currentCol = col;


    while (
        isInsideBoard(
            currentRow,
            currentCol
        ) &&
        board[currentRow][currentCol]
    ) {

        word +=
            board[currentRow][currentCol];


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


/* =========================================
   GET ALL BOARD WORDS
   ========================================= */

function getAllBoardWords() {

    const words = [];


    /* ---------------------------------
       HORIZONTAL WORDS
    --------------------------------- */

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        let col = 0;

        while (
            col < BOARD_SIZE
        ) {

            if (
                board[row][col]
            ) {

                const startCol = col;

                let word = "";


                while (
                    col < BOARD_SIZE &&
                    board[row][col]
                ) {

                    word +=
                        board[row][col];

                    col++;

                }


                if (
                    word.length >= 2
                ) {

                    words.push({

                        word: word,

                        direction:
                            "horizontal",

                        row: row,

                        col: startCol

                    });

                }

            } else {

                col++;

            }

        }

    }


    /* ---------------------------------
       VERTICAL WORDS
    --------------------------------- */

    for (
        let col = 0;
        col < BOARD_SIZE;
        col++
    ) {

        let row = 0;

        while (
            row < BOARD_SIZE
        ) {

            if (
                board[row][col]
            ) {

                const startRow = row;

                let word = "";


                while (
                    row < BOARD_SIZE &&
                    board[row][col]
                ) {

                    word +=
                        board[row][col];

                    row++;

                }


                if (
                    word.length >= 2
                ) {

                    words.push({

                        word: word,

                        direction:
                            "vertical",

                        row: startRow,

                        col: col

                    });

                }

            } else {

                row++;

            }

        }

    }


    return words;

}


/* =========================================
   CHECK BOARD VALIDITY
   ========================================= */

function isBoardValid() {

    const words =
        getAllBoardWords();


    for (
        const item of words
    ) {

        /*
           Every connected sequence
           of 2+ letters must exist
           in the dictionary.
        */

        if (
            item.word.length >= 2 &&
            !dictionarySet.has(
                item.word
            )
        ) {

            return false;

        }

    }


    return true;

}


/* =========================================
   GET EXISTING LETTERS
   ========================================= */

function getExistingLetters() {

    const letters = [];


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

                letters.push({

                    row: row,

                    col: col,

                    letter:
                        board[row][col]

                });

            }

        }

    }


    return letters;

}


/* =========================================
   GET EXISTING WORD DIRECTION
   ========================================= */

function getExistingWordDirection(
    row,
    col
) {

    let horizontal = false;

    let vertical = false;


    if (
        col > 0 &&
        board[row][col - 1]
    ) {

        horizontal = true;

    }


    if (
        col < BOARD_SIZE - 1 &&
        board[row][col + 1]
    ) {

        horizontal = true;

    }


    if (
        row > 0 &&
        board[row - 1][col]
    ) {

        vertical = true;

    }


    if (
        row < BOARD_SIZE - 1 &&
        board[row + 1][col]
    ) {

        vertical = true;

    }


    if (
        horizontal &&
        !vertical
    ) {

        return "horizontal";

    }


    if (
        vertical &&
        !horizontal
    ) {

        return "vertical";

    }


    if (
        horizontal &&
        vertical
    ) {

        return "both";

    }


    return null;

}


/* =========================================
   TRY TO PLACE WORD
   ========================================= */

function tryPlaceWord(
    word,
    row,
    col,
    direction
) {

    /*
       Generated words must be
       3–8 letters long.
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
       Word must exist in dictionary.
    */

    if (
        !dictionarySet.has(word)
    ) {

        return false;

    }


    /*
       Make sure word fits on board.
    */

    if (
        direction === "horizontal"
    ) {

        if (
            col < 0 ||
            col + word.length >
                BOARD_SIZE
        ) {

            return false;

        }

    } else {

        if (
            row < 0 ||
            row + word.length >
                BOARD_SIZE
        ) {

            return false;

        }

    }


    let hasOverlap = false;

    let addsNewTile = false;


    /*
       Check each position.
    */

    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        let currentRow = row;

        let currentCol = col;


        if (
            direction === "horizontal"
        ) {

            currentCol += i;

        } else {

            currentRow += i;

        }


        const existingLetter =
            board[
                currentRow
            ][
                currentCol
            ];


        if (
            existingLetter
        ) {

            /*
               Existing letters must match.
            */

            if (
                existingLetter !==
                word[i]
            ) {

                return false;

            }


            hasOverlap = true;

        } else {

            addsNewTile = true;

        }

    }


    /*
       New words must cross an
       existing word.
    */

    if (
        !hasOverlap
    ) {

        return false;

    }


    /*
       Word must add at least
       one new tile.
    */

    if (
        !addsNewTile
    ) {

        return false;

    }


    /*
       Make a backup of the board.
    */

    const oldBoard =
        copyBoard(board);


    /*
       Place the word temporarily.
    */

    putWord(
        word,
        row,
        col,
        direction
    );


    /*
       Check that every resulting
       word is valid.
    */

    if (
        !isBoardValid()
    ) {

        board = oldBoard;

        return false;

    }


    /*
       Don't place duplicate words.
    */

    for (
        const existingWord
        of placedWords
    ) {

        if (
            existingWord.word === word
        ) {

            board = oldBoard;

            return false;

        }

    }


    /*
       Store the word.
    */

    placedWords.push({

        word: word,

        row: row,

        col: col,

        direction: direction

    });


    return true;

}


/* =========================================
   SHUFFLE ARRAY
   ========================================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }


    return array;

}


/* =========================================
   FIND CROSSING WORD
   ========================================= */

function findCrossingWord() {

    const existingLetters =
        getExistingLetters();


    if (
        existingLetters.length === 0
    ) {

        return false;

    }


    shuffle(existingLetters);


    for (
        const existingCell
        of existingLetters
    ) {

        const letter =
            existingCell.letter;


        /*
           Find 3–8 letter words
           containing this letter.
        */

        let candidates =
            dictionary.filter(
                word =>

                    word.length >=
                        MIN_WORD_LENGTH &&

                    word.length <=
                        MAX_WORD_LENGTH &&

                    word.includes(letter)
            );


        shuffle(candidates);


        const maxCandidates =
            Math.min(
                candidates.length,
                80
            );


        for (
            let i = 0;
            i < maxCandidates;
            i++
        ) {

            const word =
                candidates[i];


            /*
               Try every occurrence of
               the crossing letter.
            */

            for (
                let letterIndex = 0;
                letterIndex < word.length;
                letterIndex++
            ) {

                if (
                    word[letterIndex] !==
                    letter
                ) {

                    continue;

                }


                /*
                   Prefer perpendicular
                   crossings.
                */

                const existingDirection =
                    getExistingWordDirection(
                        existingCell.row,
                        existingCell.col
                    );


                let directions = [];


                if (
                    existingDirection ===
                    "horizontal"
                ) {

                    directions = [
                        "vertical"
                    ];

                } else if (
                    existingDirection ===
                    "vertical"
                ) {

                    directions = [
                        "horizontal"
                    ];

                } else {

                    directions = [
                        "horizontal",
                        "vertical"
                    ];

                }


                shuffle(directions);


                for (
                    const direction
                    of directions
                ) {

                    let startRow =
                        existingCell.row;

                    let startCol =
                        existingCell.col;


                    if (
                        direction ===
                        "horizontal"
                    ) {

                        startCol -=
                            letterIndex;

                    } else {

                        startRow -=
                            letterIndex;

                    }


                    if (
                        tryPlaceWord(
                            word,
                            startRow,
                            startCol,
                            direction
                        )
                    ) {

                        return true;

                    }

                }

            }

        }

    }


    return false;

}


/* =========================================
   GET STARTING WORD
   ========================================= */

function getStartingWord() {

    const candidates =
        dictionary.filter(
            word =>

                word.length >=
                    STARTING_WORD_MIN_LENGTH &&

                word.length <=
                    BOARD_SIZE
        );


    if (
        candidates.length === 0
    ) {

        return null;

    }


    const index =
        Math.floor(
            Math.random() *
            candidates.length
        );


    return candidates[index];

}


/* =========================================
   PLACE FIRST WORD
   ========================================= */

function placeFirstWord(word) {

    const startCol =
        CENTRE_COL -
        Math.floor(
            word.length / 2
        );


    if (
        startCol < 0 ||
        startCol + word.length >
            BOARD_SIZE
    ) {

        return false;

    }


    /*
       Place horizontally through
       the centre row.
    */

    putWord(
        word,
        CENTRE_ROW,
        startCol,
        "horizontal"
    );


    placedWords.push({

        word: word,

        row: CENTRE_ROW,

        col: startCol,

        direction: "horizontal"

    });


    return true;

}


/* =========================================
   GENERATE BOARD
   ========================================= */

function generateBoard() {

    createEmptyBoard();

    placedWords = [];


    /*
       Pick starting word.
    */

    const startingWord =
        getStartingWord();


    if (
        !startingWord
    ) {

        console.error(
            "No starting word of 11 letters or more was found."
        );

        alert(
            "No suitable starting word was found in dictionary.txt."
        );

        return;

    }


    /*
       Place starting word.
    */

    if (
        !placeFirstWord(
            startingWord
        )
    ) {

        console.error(
            "Could not place starting word."
        );

        return;

    }


    /*
       Add crossing words.
    */

    let attempts = 0;

    const MAX_ATTEMPTS = 500;


    while (
        placedWords.length <
            TARGET_WORD_COUNT &&
        attempts <
            MAX_ATTEMPTS
    ) {

        const wordCountBefore =
            placedWords.length;


        findCrossingWord();


        attempts++;


        if (
            placedWords.length ===
            wordCountBefore
        ) {

            continue;

        }

    }


    console.log(
        "Board generated."
    );


    console.log(
        "Words:",
        placedWords
    );


    console.log(
        "Word count:",
        placedWords.length
    );


    displayBoard();

    displayWordList();

}


/* =========================================
   DISPLAY BOARD
   ========================================= */

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


            if (
                letter
            ) {

                cell.classList.add(
                    "letter"
                );


                /*
                   Just display the
                   letter.

                   No tile value number.
                */

                cell.textContent =
                    letter;

            }


            boardElement.appendChild(
                cell
            );

        }

    }

}


/* =========================================
   DISPLAY WORD LIST
   ========================================= */

function displayWordList() {

    wordListElement.innerHTML = "";


    wordCountElement.textContent =
        placedWords.length +
        " words";


    /*
       Longest words first.
    */

    const sortedWords =
        [...placedWords].sort(
            (a, b) =>
                b.word.length -
                a.word.length
        );


    for (
        const item
        of sortedWords
    ) {

        const wordElement =
            document.createElement(
                "div"
            );


        wordElement.className =
            "word";


        /*
           Keep the Scrabble score
           in the word list.
        */

        const score =
            calculateWordScore(
                item.word
            );


        wordElement.textContent =
            item.word +
            " (" +
            score +
            ")";


        wordListElement.appendChild(
            wordElement
        );

    }

}


/* =========================================
   LOAD DICTIONARY
   ========================================= */

async function loadDictionary() {

    try {

        const response =
            await fetch(
                "dictionary.txt"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load dictionary.txt"
            );

        }


        const text =
            await response.text();


        /*
           Convert dictionary into
           uppercase words.
        */

        const words =
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
                        /^[A-Z]+$/.test(
                            word
                        )
                )
                .filter(
                    word =>
                        word.length >= 2
                );


        /*
           Remove duplicates.
        */

        dictionary =
            [...new Set(words)];


        dictionarySet =
            new Set(dictionary);


        console.log(
            "Dictionary loaded:",
            dictionary.length,
            "words"
        );


        /*
           Check starting words.
        */

        const startingWords =
            dictionary.filter(
                word =>
                    word.length >=
                        STARTING_WORD_MIN_LENGTH &&
                    word.length <=
                        BOARD_SIZE
            );


        console.log(
            "Starting words available:",
            startingWords.length
        );


        if (
            startingWords.length === 0
        ) {

            alert(
                "dictionary.txt does not contain any words between 11 and 15 letters."
            );

            return;

        }


        /*
           Generate first board.
        */

        generateBoard();

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "There was a problem loading dictionary.txt. Check that dictionary.txt is in the same folder as index.html."
        );

    }

}


/* =========================================
   GENERATE BUTTON
   ========================================= */

generateButton.addEventListener(
    "click",
    generateBoard
);


/* =========================================
   START APPLICATION
   ========================================= */

loadDictionary();
```
