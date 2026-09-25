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
                   Create the large
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


                cell.appendChild(
                    letterElement
                );


                /*
                   Get the Scrabble
                   point value.
                */

                const value =
                    getLetterValue(
                        letter
                    );


                /*
                   Create the small
                   point number.
                */

                const valueElement =
                    document.createElement(
                        "span"
                    );


                valueElement.className =
                    "tile-value";


                valueElement.textContent =
                    value;


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
