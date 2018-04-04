(function (){
    //based on https://en.wikipedia.org/wiki/Tic-tac-toe#Further_details
    //
    //     j=0 j=1 j=2
    // i=0  1   2   3
    // i=1  4   5   6
    // i=2  7   8   9
    //
    // iterate through all possible numbers up to 999,999,999
    // for each, check if the game can actually be played
    // by trying it => if it can, record the pattern, so we know
    // how many games exist and record who won and how quickly
    // so that we can work out where the best place to start truly
    // is. trying to analyse where the best starting move is, and how many
    // unique games exist.

    function convertIndexToCoordinates(n){
        switch(n){
            case 1: return [0, 0];
            case 2: return [0, 1];
            case 3: return [0, 2];
            case 4: return [1, 0];
            case 5: return [1, 1];
            case 6: return [1, 2];
            case 7: return [2, 0];
            case 8: return [2, 1];
            case 9: return [2, 2];
            default: throw new Error("unexpected index " + n);
        }
    }


    let uniqueGames = {};
    let stats = {
        cornerXWins5: 0,
        sideXWins5: 0,
        centreXWins5: 0,
        cornerOWins6: 0,
        sideOWins6: 0,
        centreOWins6: 0,
        cornerXWins7: 0,
        sideXWins7: 0,
        centreXWins7: 0,
        cornerOWins8: 0,
        sideOWins8: 0,
        centreOWins8: 0,
        cornerXWins9: 0,
        sideXWins9: 0,
        centreXWins9: 0,
        cornerDraws: 0,
        sideDraws: 0,
        centreDraws: 0,
        numStupidGames: 0
    };
    for(var game = 123456789; game <= 999999999; game++){
        let gameAsString = '' + game;

        //can only accept games with unique combinations. cannot go in same place twice!
        let isValidGame = true;
        for(idx = 1; idx < 10; idx++) {
            if(gameAsString.indexOf("" + idx) === -1 //only valid if every digit from 1-9 is found
               || gameAsString.charAt(idx-1) === '0') //only 1-9 are valid
            {
                isValidGame = false;
                break;
            }
        }

        if(isValidGame){
            let board = buildEmtpyBoard();
            let moves = '';
            let isStupid = false;
            for(idx = 0; idx < gameAsString.length; idx++){
                let c = gameAsString[idx];
                moves += c;
                let coords = convertIndexToCoordinates(parseInt(c));
                if(board[coords[0]][coords[1]].v) throw new Error("cell " + i + "," + j + " is already selected by " + board[coords[0]][coords[1]].v);
                let player = idx % 2 === 0 ? X : O;
                let rival = player === X ? O : X;

                //is this move a stupid one? then note that for later => we only want to know about the games with realistic moves
                if(!isStupid && determineIfStupid(board, player, rival, coords[0], coords[1])){
                    isStupid = true;
                }

                //move
                board[coords[0]][coords[1]].v = player;

                let winner = checkFinished(board);
                if(winner){
                    let o = uniqueGames[moves];

                    if(!o){
                        //it doesnt exist. update stats
                        updateStats(gameAsString, winner, idx, stats, isStupid);
                        uniqueGames[moves] = {};
                    }

                    break;
                }
            }
        }

        if(game % 1000000 === 0){
            console.log("finished with game " + game + ", stats: " + JSON.stringify(stats));
        }
    }

    console.log("found these stats: " + JSON.stringify(stats));
    let total = 0;
    Object.keys(stats).forEach(function(e){ total += stats[e]; });
    console.log("total number of unique games: " + total);

    function updateStats(gameAsString, winner, idx, stats, isStupid){
        if(isStupid){
            stats.numStupidGames++;
        }else{
            let coords = convertIndexToCoordinates(parseInt(gameAsString[0]));
            if(coords[0] === 1 && coords[1] === 1){
                if(winner === X){
                    if(idx+1 === 5){
                        stats.centreXWins5++;
                    }else if(idx+1 === 7){
                        stats.centreXWins7++;
                    }else if(idx+1 === 9){
                        stats.centreXWins9++;
                    }else throw new Error("game :" + gameAsString + "/" + coords[0] + "," + coords[1] + "/" + winner + "/" + (idx+1));
                }else if(winner === O){
                    if(idx+1 === 6){
                        stats.centreOWins6++;
                    }else if(idx+1 === 8){
                        stats.centreOWins8++;
                    }else throw new Error("game :" + gameAsString + "/" + coords[0] + "," + coords[1] + "/" + winner + "/" + (idx+1));
                } else {
                    stats.centreDraws++;
                }
            } else if(coords[0] === 1 || coords[1] === 1){
                if(winner === X){
                    if(idx+1 === 5){
                        stats.sideXWins5++;
                    }else if(idx+1 === 7){
                        stats.sideXWins7++;
                    }else if(idx+1 === 9){
                        stats.sideXWins9++;
                    }else throw new Error("game :" + gameAsString + "/" + coords[0] + "," + coords[1] + "/" + winner + "/" + (idx+1));
                }else if(winner === O){
                    if(idx+1 === 6){
                        stats.sideOWins6++;
                    }else if(idx+1 === 8){
                        stats.sideOWins8++;
                    }else throw new Error("game :" + gameAsString + "/" + coords[0] + "," + coords[1] + "/" + winner + "/" + (idx+1));
                } else {
                    stats.sideDraws++;
                }
            }else{
                if(winner === X){
                    if(idx+1 === 5){
                        stats.cornerXWins5++;
                    }else if(idx+1 === 7){
                        stats.cornerXWins7++;
                    }else if(idx+1 === 9){
                        stats.cornerXWins9++;
                    }else throw new Error("game :" + gameAsString + "/" + coords[0] + "," + coords[1] + "/" + winner + "/" + (idx+1));
                }else if(winner === O){
                    if(idx+1 === 6){
                        stats.cornerOWins6++;
                    }else if(idx+1 === 8){
                        stats.cornerOWins8++;
                    }else throw new Error("game :" + gameAsString + "/" + coords[0] + "," + coords[1] + "/" + winner + "/" + (idx+1));
                } else {
                    stats.cornerDraws++;
                }
            }
        }
    }

    //determines if its a stupid game because an instant win/loss is ignored
    function determineIfStupid(board, player, rival, nexti, nextj) {
        // copy board
        var copyOfBoard = buildEmtpyBoard();
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                copyOfBoard[i][j].v = board[i][j].v;
            }
        }
        // attempt all places that are free
        let numMissedWins = 0;
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                if(!copyOfBoard[i][j].v){
                    copyOfBoard[i][j].v = player;
                    if(checkFinished(copyOfBoard) === player){
                        if(nexti === i && nextj === j){
                            return false; //no need to continue, its not stupid, its going to win
                        }else{
                            //it had no intention of filling that spot and as such is STUPID! it missed out on an obvious win
                            numMissedWins++;
                        }
                    }

                    //reset and try next free cell
                    delete copyOfBoard[i][j].v;
                }
            }
        }

        //if it could have won, but didnt, then its stupid
        if(numMissedWins > 0){
            return true;
        }

        // ////////////////////////////
        // avoid instant loss
        // ////////////////////////////
        let numPlacesNeededToBlockRivalWinning = 0;
        let isGoingToBlockRivalWinning = false;
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                if(!copyOfBoard[i][j].v){
                    copyOfBoard[i][j].v = rival;
                    if(checkFinished(copyOfBoard) === rival){
                        numPlacesNeededToBlockRivalWinning++;
                        if(nexti === i && nextj === j){
                            // it is going to avoid a loss
                            isGoingToBlockRivalWinning = true;
                        }
                    }
                    // reset and try next free cell
                    delete copyOfBoard[i][j].v;
                }
            }
        }

        if(numPlacesNeededToBlockRivalWinning === 1 && !isGoingToBlockRivalWinning){
            return true;
        }

        //else if numPlacesNeededToBlockRivalWinning === 0 => its not stupid, coz its not going to lose
        //else if numPlacesNeededToBlockRivalWinning  >  1 => its not stupid, coz it cant help losing, the rival forked
        //else if isGoingToBlockRivalWinning = true        => its not stupid, coz its doing its best

        return false;
    }


})();
