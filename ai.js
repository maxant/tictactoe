//this file contains code relating to the AI algorithm

/** this is where the heavy lifting is done. */
function doAiMove(player, rival){

    // ////////////////////////////////////////////////////
    // No instant win, so use the policy to get a win
    // ////////////////////////////////////////////////////

    model.currentPatternKnown = "Yes";

    let move, possibleMove;

    // have we seen this pattern?
    let pattern = buildPattern(model.board);
    console.debug('pattern ' + pattern);

    // state, aka memory
    let memory = model.patterns[pattern];
    if(memory){

        let explore = decideWhetherToExplore();

        // determine Q i.e. a function based on state and actions
        // placesToMove contains all possible actions and maps those actions to known rewards. the policy can
        // use it to select the "best" move
        let placesToMove = determinePlacesToMove(explore, memory, player, model.board);

        // select based on policy
        let placeToMove = getPlaceToMoveBasedOnPolicy(placesToMove, explore);

        if(placeToMove.untried && !explore){
            model.currentPatternKnown += "; never tried, better than losing";
        }

        selectCell(placeToMove.i, placeToMove.j, player);
        return;
    }

    model.currentPatternKnown = "No";

    console.log("doing move randomly");
    moveRandomly(player);
}

/** *******************************************************************************************************
 * https://en.wikipedia.org/wiki/Q-learning:
 *  "A policy pi, is a rule that the agent follows in selecting actions, given the state it is in.
 *   When such an action-value function is learned, the optimal policy can be constructed by selecting
 *   the action with the highest value in each state."
 * The highest value is based on the rewards which were learned from previous games
 ******************************************************************************************************* */
function getPlaceToMoveBasedOnPolicy(placesToMove, explore) {
    placesToMove.sort(function(a, b){
        return a.reward < b.reward;
    });
    console.log("sorted places to move: " + JSON.stringify(placesToMove.map(function(e){return {i: e.i, j: e.j, r: e.reward};})));

    //if exploring, all unknown places were given higher rewards than known moves, so they are now at the front
    //of the list. if all places are known, then exploring doesn't really make sense? actually it does, because
    //maybe last time we lost with a certain move, but this time we can win! so that means there is no point
    //in setting the reward of unknown places.
    //otherwise, select all those with the highest reward, and move randomly within that subset
    if(!explore) {
        placesToMove = placesToMove.filter(function(a){
            return a.reward === placesToMove[0].reward;
        });
        console.log("filtered places to move: " + JSON.stringify(placesToMove.map(function(e){return {i: e.i, j: e.j, r: e.reward};})));
    }
    let indexToMove = getRandomInt(0, placesToMove.length);
    console.log("using index: " + indexToMove + ". exploring? " + explore);
    return placesToMove[indexToMove];
}

function decideWhetherToExplore() {
    var explore = false;
    if(model.useExploring.active) {
        let hi;
        if(model.totalUniqueGames > 3000){
            hi = 10; //10%
        }else if(model.totalUniqueGames > 2000){
            hi = 5; //20%
        }else if(model.totalUniqueGames > 1000){
            hi = 3; //33%
        }else if(model.totalUniqueGames > 500){
            hi = 2; //50%
        }else{
            hi = 1; //always explore
        }
        explore = getRandomInt(0, hi) === 0;
        model.chanceOfExploring = 100 / hi;
    }
    console.debug('explore: ' + explore);
    if(explore) {
        model.numExplorations++;
    }

    return explore;
}

/** *******************************************************************************************************
 * placesToMove is effectively the action-value function Q(s, a) which gives the expected utility of a
 * given action 'a' while in a given state 's' (https://en.wikipedia.org/wiki/Q-learning).
 * so we can use it to find the best action based on previous rewards.
 * since we want to move to the place with the highest reward, we sort the values by reward.
 ******************************************************************************************************** */
function determinePlacesToMove(explore, memory, player, board) {

    let placesToMove = [];

    //structure:
    //memory = {
    //  possibleNextMoves: [{
    //    i: 0,
    //    j: 0,
    //    xWinRewards: 0,
    //    oWinRewards: 0,
    //    drawRewards: 0
    //  }]
    //}

    for(pnm = 0; pnm < memory.possibleNextMoves.length; pnm++){
        possibleMove = memory.possibleNextMoves[pnm];
        if(!board[possibleMove.i][possibleMove.j].v){
            let move = buildMoveWithRewards(possibleMove, player);

            placesToMove.push(move);

            console.debug('possible known move: ' + JSON.stringify(move));
        }
    }

    // add some logging info for later...
    if(placesToMove.length > 0){
        model.currentPatternKnown = "Yes";
        if(explore){
            model.currentPatternKnown += ", but exploring";
        }
    }else {
        model.currentPatternKnown = "No";
    }

    //finally add unknown places with a reward of 0, since its unknown. better to go there than a place which is known to lose.
    for(i = 0; i < board.length; i++){
        for(j = 0; j < board[i].length; j++){
            if(!board[i][j].v){
                var found = false;
                for(pnm = 0; pnm < placesToMove.length; pnm++){
                    if(placesToMove[pnm].i === i &&
                       placesToMove[pnm].j === j){

                       found = true;
                       break;
                   }
                }
                if(!found){

                    let move = buildMove(0, 0, 0, i, j);
                    move.untried = true;
                    move.reward = 0;

                    placesToMove.push(move);

                    console.debug('found unknown place to move: ' + JSON.stringify(placesToMove[placesToMove.length-1]));
                }
            }
        }
    }
    return placesToMove;
}

function buildMoveWithRewards(possibleMove, player) {
    let winRewards = player === X ? possibleMove.xWinRewards : possibleMove.oWinRewards;
    let drawRewards = possibleMove.drawRewards;
    let lossRewards = player === X ? possibleMove.oWinRewards : possibleMove.xWinRewards;

    let move = buildMove(winRewards, drawRewards, lossRewards, possibleMove.i, possibleMove.j);

    //TODO how to tune this function?
    var total = winRewards + drawRewards + lossRewards;

    //divide by total, because otherwise it seems to learn that one place is GREAT and doesnt give other ones a chance.
    //this way, we work out the win ratio regardless of how often its been played. so its normalised in comparison to the others.
    move.reward = (100*(winRewards/total)) + (10*(drawRewards/total)) + (-1*(lossRewards/total));

    return move;
}

function buildMove(winRewards, drawRewards, lossRewards, i, j) {

    let move = {
        winRewards: winRewards,
        drawRewards: drawRewards,
        lossRewards: lossRewards,
        i: i,
        j: j
    };

    return move;
}

function buildPattern(board) {
    var pattern = "";
    var v;
    for(i = 0; i < board.length; i++){
        for(j = 0; j < board[i].length; j++){
            v = board[i][j].v;
            if(!v){
                v = "-";
            }
            pattern += v;
        }
        pattern += "|";
    }
    return pattern;
}

function moveRandomly(player) {
    var k = 0;
    while(true){
        k++;
        if(k > 10000){
			//very unlikely to happen
            console.log("failed to move randomly. moving deterministically!");
            if(!moveDeterministically(player)){
				//should only happen if theres a bug
                console.log("unable to move randomly or deterministically");
            }
            break;
        }else{
            var i = getRandomInt(0, model.board.length);
            var j = getRandomInt(0, model.board.length);
            var cell = model.board[i][j];
            if(!cell.v){
                selectCell(i, j, player);
                break;
            }
        }
    }
}

/** does a raster scan and moves in first empty cell */
function moveDeterministically(player) {
    for(i = 0; i < model.board.length; i++){
        for(j = 0; j < model.board[i].length; j++){
            var cell = model.board[i][j];
            if(!cell.v){
                selectCell(i, j, player);
                return {i: i, j: j};
            }
        }
    }
}

function selectCell(i, j, v) {
    if(model.board[i][j].v) throw new Error("cell " + i + "," + j + " is already selected by " + model.board[i][j].v);
    if(v === COMPUTER){
        model.numAiMoves++;
    }
    console.log("selecting cell " + i + "," + j + " for " + v);
    model.board[i][j].v = v;
    model.history.push({i: i, j:j, v: v});
    console.log("=================");
}

function checkAndHandleFinished(){
    var winner = checkFinished(model.board);
    if(winner){
        model.totalGames++;
        if(winner === DRAW){
            model.draw = true;
        } else {
            model.winner = winner;
        }
		handleEnd();
    }
}

function handleEnd(){

    //remember all moves for the future
    var result = model.draw ? DRAW : model.winner;
    var recreatedBoard = buildEmtpyBoard();
    var pattern = "";
    var memory, move;
	var uniqueGameKey = "";
    for(h = -1; h < model.history.length; h++){
		if(h === -1){
			//add an empty board at the start, so the AI works out where good starting moves are
		}else{
			move = model.history[h];
			uniqueGameKey += move.i + "" + move.j + "" + move.v + "|";
			recreatedBoard[move.i][move.j].v = move.v;
		}
        pattern = buildPattern(recreatedBoard);
        memory = model.patterns[pattern];
        if(!memory){
            memory = {
                possibleNextMoves: []
            };
            model.patterns[pattern] = memory;
        }


        if(model.history[h+1]){
            var pnm = 0;
			for(; pnm < memory.possibleNextMoves.length; pnm++) {
                var possibleNextMove = memory.possibleNextMoves[pnm];
                if(possibleNextMove.i === model.history[h+1].i &&
                    possibleNextMove.j === model.history[h+1].j ){

                    break;
                }
            }

            if(pnm >= memory.possibleNextMoves.length){
                memory.possibleNextMoves.push(
                    {
                        i: model.history[h+1].i,
                        j: model.history[h+1].j,
                        xWinRewards: 0,
                        oWinRewards: 0,
                        drawRewards: 0
                    }
                );
            }

            // learning rate is 1, since, we simply add the reward to all previous rewards.
            // might be able to make the algorithm learn quicker if we start to throw away
            // earlier results, especially because they will have initially been based on
            // random moves (exploration).
			var reward = getReward(model.history.length);
            if(result === X) {
                memory.possibleNextMoves[pnm].xWinRewards += reward;
            }else if(result === O){
                memory.possibleNextMoves[pnm].oWinRewards += reward;
            }else{
                memory.possibleNextMoves[pnm].drawRewards += reward;
            }

            // discount factor... the current reward and all future rewards are weighted equally
            // so the discount factor is 1.
        }
    }

    if(model.winner === X){
        model.stats.xWins++;
    }else if(model.winner === O){
        model.stats.oWins++;
    }else{
        model.stats.draws++;
    }

	var ug = model.uniqueGames[uniqueGameKey];
	if(!ug){
		model.uniqueGames[uniqueGameKey] = 0;
	}
	model.uniqueGames[uniqueGameKey] ++;

	var totalUniqueGames = 0;
	for(key in model.uniqueGames){
		totalUniqueGames++;
	}
	console.log("Unique Games: " + totalUniqueGames);
	model.totalUniqueGames = totalUniqueGames;
}

/**
 * we want to reward MORE for quicker wins/losses
 *
 * shorter games reward more, so that we avoid instant losses and take advantage of instant wins.
 */
function getReward(gameLength){
	//TODO this can also be tuned
	switch(gameLength) {
		case 9:
			return 1;
		case 8:
			return 2;
		case 7:
			return 4;
		case 6:
			return 8;
		default:
			return 16;
	}
}

