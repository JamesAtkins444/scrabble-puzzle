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

                cell.classList.add(
                    "letter"
                );


                /*
                   Create the main
                   letter.
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
                   Create the small
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


                /*
                   Add both elements
                   to the tile.
                */

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
