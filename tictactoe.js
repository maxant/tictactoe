/** returns DRAW if all squares are full with no winner, otherwise COMPUTER or HUMAN depending on who won. otherwise undefined. */
function checkFinished(board) {
    var i, j, winner;

	// TODO rewrite this function to be dynamic so that it works with any board size

    function sameNotNullHorizontal(i){
        return board[i][0].v === board[i][1].v &&
               board[i][1].v === board[i][2].v &&
               board[i][0].v;
    }
    for(i = 0; i < board.length; i++){
        if(sameNotNullHorizontal(i)){
            winner = board[i][0].v;
        }
    }

    function sameNotNullVertical(j){
        return board[0][j].v === board[1][j].v &&
               board[1][j].v === board[2][j].v &&
               board[0][j].v;
    }
    for(j = 0; j < board.length; j++){
        if(sameNotNullVertical(j)){
            winner = board[0][j].v;
        }
    }

    if(board[0][0].v &&
        board[0][0].v === board[1][1].v &&
        board[1][1].v === board[2][2].v
    ){
        winner = board[1][1].v;
    }

    if(board[0][2].v &&
        board[0][2].v === board[1][1].v &&
        board[1][1].v === board[2][0].v
    ){
        winner = board[1][1].v;
    }

    if(!winner){
        //check for a draw
        var allFull = true;
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                if(!board[i][j].v){
                    allFull = false;
                    break;
                }
            }
        }
        if(allFull){
            return DRAW;
        }
    }

    return winner;
}

/** used to determine if the algo is now intelligent */
function hasLearnedEverything(){
    return hasLearnedBestPlaceToStart()
        && hasLearnedBestPlaceToCounter()
    /* && TODO */;
}

function hasLearnedBestPlaceToStart(){
    return knowsWhereToGo("---|---|---|", X, 1, 1);
}

function hasLearnedBestPlaceToCounter(){
    return knowsWhereToGo("X--|---|---|", O, 1, 1)
        && knowsWhereToGo("--X|---|---|", O, 1, 1)
        && knowsWhereToGo("---|---|X--|", O, 1, 1)
        && knowsWhereToGo("---|---|--X|", O, 1, 1)
        && (knowsWhereToGo("---|-X-|---|", O, 0, 0)
             || knowsWhereToGo("---|-X-|---|", O, 0, 2)
             || knowsWhereToGo("---|-X-|---|", O, 2, 0)
             || knowsWhereToGo("---|-X-|---|", O, 2, 2)
           )
    ;

    //TODO other counters
}

function knowsWhereToGo(pattern, player, assertI, assertJ){
    let memory = model.patterns[pattern];
    if(memory){
        let board = buildEmtpyBoard();
        let rows = pattern.split("|");
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                if(rows[i].charAt(j) === X){
                    board[i][j].v = X;
                }else if(rows[i].charAt(j) === O){
                    board[i][j].v = O;
                }
            }
        }
        let explore = false;
        let placesToMove = determinePlacesToMove(explore, memory, player, board);
        if(placesToMove.length){
            placesToMove.sort(function(a, b){
                return a.reward < b.reward;
            });

            if(placesToMove[0].i === assertI && placesToMove[0].j === assertJ){
                return true;
            }
        }
    }

    return false;
}
