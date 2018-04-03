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
    // is.

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
        centreDraws: 0
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
            for(idx = 0; idx < gameAsString.length; idx++){
                let c = gameAsString[idx];
                moves += c;
                let coords = convertIndexToCoordinates(parseInt(c));
                board[coords[0]][coords[1]].v = (idx % 2 === 0 ? X : O);

                let winner = checkFinished(board);
                if(winner){
                    let o = uniqueGames[moves];
                    if(!o){
                        o = {
                            xWins: 0,
                            oWins: 0,
                            draws: 0,
                            gameLength: idx + 1
                        };
                        uniqueGames[moves] = o;
                    }
                    if(winner === X) {
                         o.xWins++;
                    } else if (winner === O) {
                         o.oWins++;
                    } else if (winner === DRAW) {
                         o.draws++;
                    } else {
                        throw new Error("unknown winner: " + winner + " for game " + gameAsString + " and index " + idx);
                    }

                    coords = convertIndexToCoordinates(parseInt(gameAsString[0]));
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

                    break;
                }
            }
        }

        if(game % 100000 === 0){
            console.log("finished with game " + game + ", stats: " + JSON.stringify(stats));
        }
    }

    console.log("found " + Object.keys(uniqueGames).length + " unique games");
})();
