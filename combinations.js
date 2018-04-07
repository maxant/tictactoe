function init(){
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
        centreDraws: 0
    };
    let forkStats = JSON.parse(JSON.stringify(stats));
    let stupidStats = JSON.parse(JSON.stringify(stats));
    let game = 123456789;

    run();

    function run() {
        for(var z = 0; z < 3000000; z++) {
            if(game > 999999999){
                break;
            }

            let gameAsString = '' + game;

            //can only accept unique combinations. no player can go any cell already used!
            let isValidCombination = true;
            for(idx = 1; idx < 10; idx++) {
                if(gameAsString.indexOf('' + idx) === -1 //only valid if every digit from 1-9 is found
                   || gameAsString.charAt(idx-1) === '0') //only 1-9 are valid
                {
                    isValidCombination = false;
                    break;
                }
            }

            if(isValidCombination){
                let board = buildEmtpyBoard();
                let moves = '';
                let isStupid = false;
                let isWinningWithFork = false;
                for(idx = 0; idx < gameAsString.length; idx++){
                    let c = gameAsString[idx];
                    moves += c; //initially e.g. '1', then '12', etc.
                    let coords = convertIndexToCoordinates(parseInt(c)); //turns e.g. '3' into [0,2]
                    if(board[coords[0]][coords[1]].v)
                        throw new Error("cell " + i + "," + j + " is already selected by " + board[coords[0]][coords[1]].v);
                    let player = idx % 2 === 0 ? X : O;
                    let rival = player === X ? O : X;

                    //is this move a stupid one? then note that for later => we only want to know about the games with realistic moves
                    if(!isStupid && determineIfStupid(board, player, rival, coords[0], coords[1])){
                        isStupid = true;
                    }
                    if(determineIfWinningWithFork(board, player, coords[0], coords[1])){
                        isWinningWithFork = true;
                    }

                    //move
                    board[coords[0]][coords[1]].v = player;

                    let winner = checkFinished(board);
                    if(winner){
                        let o = uniqueGames[moves];

                        if(!o){
                            let relevantStats = stats;
                            if(isStupid){
                                relevantStats = stupidStats;
                            } else if(isWinningWithFork){
                                relevantStats = forkStats;
                            }

                            //it doesnt exist. update stats
                            updateStats(gameAsString, winner, idx, relevantStats);
                            uniqueGames[moves] = {}; //record this game so it isn't harvested again
                        }

                        break;
                    }
                }
            }

            game++;
        }

        let total = 0;
        Object.keys(stats).forEach(function(e){ total += stats[e]; });
        Object.keys(forkStats).forEach(function(e){ total += forkStats[e]; });
        Object.keys(stupidStats).forEach(function(e){ total += stupidStats[e]; });
        log("finished with game " + (game-1) + "<br>total number of unique games: " + total + "<br>" + (100*total/255168).toFixed(2) + "% done<br><br>stats: " + JSON.stringify(stats, null, 4) + "<br>fork stats: " + JSON.stringify(forkStats, null, 4)
         + "<br>stupid stats: " + JSON.stringify(stupidStats, null, 4));

        if(game <= 999999999){
            setTimeout(run, 0);
        }else{
            let corners = stats.cornerXWins5 + stats.cornerXWins7 + stats.cornerXWins9;
            corners += stupidStats.cornerXWins5 + stupidStats.cornerXWins7 + stupidStats.cornerXWins9;
            corners += forkStats.cornerXWins5 + forkStats.cornerXWins7 + forkStats.cornerXWins9;
            corners /= 4;
            let edges = stats.sideXWins5 + stats.sideXWins7 + stats.sideXWins9;
            edges += stupidStats.sideXWins5 + stupidStats.sideXWins7 + stupidStats.sideXWins9;
            edges += forkStats.sideXWins5 + forkStats.sideXWins7 + forkStats.sideXWins9;
            edges /= 4;
            let center = stats.centreXWins5 + stats.centreXWins7 + stats.centreXWins9;
            center += stupidStats.centreXWins5 + stupidStats.centreXWins7 + stupidStats.centreXWins9;
            center += forkStats.centreXWins5 + forkStats.centreXWins7 + forkStats.centreXWins9;
            let results = "Number of wins by first player, all games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";

            corners = stats.cornerOWins6 + stats.cornerOWins8;
            corners += stupidStats.cornerOWins6 + stupidStats.cornerOWins8;
            corners += forkStats.cornerOWins6 + forkStats.cornerOWins8;
            corners /= 4;
            edges = stats.sideOWins6 + stats.sideOWins8;
            edges += stupidStats.sideOWins6 + stupidStats.sideOWins8;
            edges += forkStats.sideOWins6 + forkStats.sideOWins8;
            edges /= 4;
            center = stats.centreOWins6 + stats.centreOWins8;
            center += stupidStats.centreOWins6 + stupidStats.centreOWins8;
            center += forkStats.centreOWins6 + forkStats.centreOWins8;
            results += "Number of losses by first player, all games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";

            corners = stats.cornerDraws;
            corners += stupidStats.cornerDraws;
            corners += forkStats.cornerDraws;
            corners /= 4;
            edges = stats.sideDraws;
            edges += stupidStats.sideDraws;
            edges += forkStats.sideDraws;
            edges /= 4;
            center = stats.centreDraws;
            center += stupidStats.centreDraws;
            center += forkStats.centreDraws;
            results += "Number of draws by first player, all games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";



            corners = stats.cornerXWins5 + stats.cornerXWins7 + stats.cornerXWins9;
            corners += stupidStats.cornerXWins5 + stupidStats.cornerXWins7 + stupidStats.cornerXWins9;
            corners += forkStats.cornerXWins5 + forkStats.cornerXWins7 + forkStats.cornerXWins9;
            corners /= 4;
            corners *= 100;
            edges = stats.sideXWins5 + stats.sideXWins7 + stats.sideXWins9;
            edges += stupidStats.sideXWins5 + stupidStats.sideXWins7 + stupidStats.sideXWins9;
            edges += forkStats.sideXWins5 + forkStats.sideXWins7 + forkStats.sideXWins9;
            edges /= 4;
            edges *= 100;
            center = stats.centreXWins5 + stats.centreXWins7 + stats.centreXWins9;
            center += stupidStats.centreXWins5 + stupidStats.centreXWins7 + stupidStats.centreXWins9;
            center += forkStats.centreXWins5 + forkStats.centreXWins7 + forkStats.centreXWins9;
            center *= 100;

            let corners2 = stats.cornerOWins6 + stats.cornerOWins8;
            corners2 += stupidStats.cornerOWins6 + stupidStats.cornerOWins8;
            corners2 += forkStats.cornerOWins6 + forkStats.cornerOWins8;
            corners2 /= 4;
            corners += -1 * corners2;
            let edges2 = stats.sideOWins6 + stats.sideOWins8;
            edges2 += stupidStats.sideOWins6 + stupidStats.sideOWins8;
            edges2 += forkStats.sideOWins6 + forkStats.sideOWins8;
            edges2 /= 4;
            edges += -1 * edges2;
            let center2 = stats.centreOWins6 + stats.centreOWins8;
            center2 += stupidStats.centreOWins6 + stupidStats.centreOWins8;
            center2 += forkStats.centreOWins6 + forkStats.centreOWins8;
            center += -1 * center2;

            corners2 = stats.cornerDraws;
            corners2 += stupidStats.cornerDraws;
            corners2 += forkStats.cornerDraws;
            corners2 /= 4;
            corners += 10 * corners2;
            edges2 = stats.sideDraws;
            edges2 += stupidStats.sideDraws;
            edges2 += forkStats.sideDraws;
            edges2 /= 4;
            edges += 10 * edges2;
            center2 = stats.centreDraws;
            center2 += stupidStats.centreDraws;
            center2 += forkStats.centreDraws;
            center += 10 * center2;
            results += "Number of points for first player, all games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";



            corners = stats.cornerXWins5 + stats.cornerXWins7 + stats.cornerXWins9;
            corners += forkStats.cornerXWins5 + forkStats.cornerXWins7 + forkStats.cornerXWins9;
            corners /= 4;
            edges = stats.sideXWins5 + stats.sideXWins7 + stats.sideXWins9;
            edges += forkStats.sideXWins5 + forkStats.sideXWins7 + forkStats.sideXWins9;
            edges /= 4;
            center = stats.centreXWins5 + stats.centreXWins7 + stats.centreXWins9;
            center += forkStats.centreXWins5 + forkStats.centreXWins7 + forkStats.centreXWins9;
            results += "Number of wins by first player, excluding stupid games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";

            corners = stats.cornerOWins6 + stats.cornerOWins8;
            corners += forkStats.cornerOWins6 + forkStats.cornerOWins8;
            corners /= 4;
            edges = stats.sideOWins6 + stats.sideOWins8;
            edges += forkStats.sideOWins6 + forkStats.sideOWins8;
            edges /= 4;
            center = stats.centreOWins6 + stats.centreOWins8;
            center += forkStats.centreOWins6 + forkStats.centreOWins8;
            results += "Number of losses by first player, excluding stupid games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";

            corners = stats.cornerDraws;
            corners += forkStats.cornerDraws;
            corners /= 4;
            edges = stats.sideDraws;
            edges += forkStats.sideDraws;
            edges /= 4;
            center = stats.centreDraws;
            center += forkStats.centreDraws;
            results += "Number of draws by first player, excluding stupid games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";



            corners = stats.cornerXWins5 + stats.cornerXWins7 + stats.cornerXWins9;
            corners += stupidStats.cornerXWins5 + stupidStats.cornerXWins7 + stupidStats.cornerXWins9;
            corners += forkStats.cornerXWins5 + forkStats.cornerXWins7 + forkStats.cornerXWins9;
            corners /= 4;
            corners *= 100;
            edges = stats.sideXWins5 + stats.sideXWins7 + stats.sideXWins9;
            edges += stupidStats.sideXWins5 + stupidStats.sideXWins7 + stupidStats.sideXWins9;
            edges += forkStats.sideXWins5 + forkStats.sideXWins7 + forkStats.sideXWins9;
            edges /= 4;
            edges *= 100;
            center = stats.centreXWins5 + stats.centreXWins7 + stats.centreXWins9;
            center += stupidStats.centreXWins5 + stupidStats.centreXWins7 + stupidStats.centreXWins9;
            center += forkStats.centreXWins5 + forkStats.centreXWins7 + forkStats.centreXWins9;
            center *= 100;

            corners2 = stats.cornerOWins6 + stats.cornerOWins8;
            corners2 += stupidStats.cornerOWins6 + stupidStats.cornerOWins8;
            corners2 += forkStats.cornerOWins6 + forkStats.cornerOWins8;
            corners2 /= 4;
            corners += -1 * corners2;
            edges2 = stats.sideOWins6 + stats.sideOWins8;
            edges2 += stupidStats.sideOWins6 + stupidStats.sideOWins8;
            edges2 += forkStats.sideOWins6 + forkStats.sideOWins8;
            edges2 /= 4;
            edges += -1 * edges2;
            center2 = stats.centreOWins6 + stats.centreOWins8;
            center2 += stupidStats.centreOWins6 + stupidStats.centreOWins8;
            center2 += forkStats.centreOWins6 + forkStats.centreOWins8;
            center += -1 * center2;

            corners2 = stats.cornerDraws;
            corners2 += stupidStats.cornerDraws;
            corners2 += forkStats.cornerDraws;
            corners2 /= 4;
            corners += 10 * corners2;
            edges2 = stats.sideDraws;
            edges2 += stupidStats.sideDraws;
            edges2 += forkStats.sideDraws;
            edges2 /= 4;
            edges += 10 * edges2;
            center2 = stats.centreDraws;
            center2 += stupidStats.centreDraws;
            center2 += forkStats.centreDraws;
            center += 10 * center2;
            results += "Number of points for first player, excluding stupid games:<table border=1>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "<tr><td>" + edges + "</td><td>" + center + "</td><td>" + edges + "</td></tr>";
            results += "<tr><td>" + corners + "</td><td>" + edges + "</td><td>" + corners + "</td></tr>";
            results += "</table><hr>";

            document.getElementById("results").innerHTML = results;
        }
    }

    function updateStats(gameAsString, winner, idx, stats){
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

    //determines if a fork is available for the player and they are about to win
    function determineIfWinningWithFork(board, player, nexti, nextj) {
        // copy board
        var copyOfBoard = buildEmtpyBoard();
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                copyOfBoard[i][j].v = board[i][j].v;
            }
        }
        // attempt all places that are free
        let numPlacesToWin = 0;
        let isGoingToWin = false;
        for(i = 0; i < board.length; i++){
            for(j = 0; j < board[i].length; j++){
                if(!copyOfBoard[i][j].v){
                    copyOfBoard[i][j].v = player;
                    if(checkFinished(copyOfBoard) === player){
                        if(nexti === i && nextj === j){
                            isGoingToWin = true;
                        }
                        numPlacesToWin++;
                    }

                    //reset and try next free cell
                    delete copyOfBoard[i][j].v;
                }
            }
        }

        return isGoingToWin && numPlacesToWin > 1;
    }


    function log(msg){
        document.getElementById("output").innerHTML = msg;
    }
}
