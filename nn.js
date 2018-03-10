//https://medium.freecodecamp.org/how-to-create-a-neural-network-in-javascript-in-only-30-lines-of-code-343dafc50d49
const { Layer, Network, Trainer, Architect } = window.synaptic;

//input: O=-1, -=0, X=1
//output: where to move to; -1 is best move for O, 1 is best move for X. raster, ie 0=(0,0), 4=(1,1), etc.

var myNetworkO = new Architect.Perceptron(9, 30, 9); //TODO train size of hidden layer
var trainerO = new Trainer(myNetworkO);
var trainingSetO = [];

var myNetworkX = new Architect.Perceptron(9, 30, 9); //TODO train size of hidden layer
var trainerX = new Trainer(myNetworkX);
var trainingSetX = [];

Object.keys(precalculated.patterns).forEach(function(key){
    let input = [];
    for (let i = 0; i < key.length; i++) {
        let c = key.charAt(i);
        if(c === 'X'){
            input.push(1);
        }else if(c === 'O'){
            input.push(-1);
        }else if(c === '-'){
            input.push(0);
        }
    }

    //now determine the best place to go
    let value = precalculated.patterns[key];
    let rewards = value.possibleNextMoves.map(function(pnm){

        //calculated in the same way which the algorithm calculates
        //TODO replace with function that is used in both places

        let winRewards = pnm.xWinRewards;
        let drawRewards = pnm.drawRewards;
        let lossRewards = pnm.oWinRewards;

        let total = winRewards + drawRewards + lossRewards;

        //divide by total, because otherwise it seems to learn that one place is GREAT and doesnt give other ones a chance.
        //this way, we work out the win ratio regardless of how often its been played. so its normalised in comparison to the others.
        let rewardX = (100*(winRewards/total)) + (10*(drawRewards/total)) + (-1*(lossRewards/total));
        let rewardO = (100*(lossRewards/total)) + (10*(drawRewards/total)) + (-1*(winRewards/total));
        return {
            i: pnm.i,
            j: pnm.j,
            rewardX: rewardX,
            rewardO: rewardO
        };
    });

    if(rewards.length >= 1){
        //TODO there could be several places to go with the same result. in that case, set several output elements to 1
        //O
        rewards.sort(function(a, b){
            return a.rewardO < b.rewardO;
        });
        //the place with the highest reward is at index 0. set all other places to have output 0, and this place to have output 1.
        let outputO = [0,0,0,0,0,0,0,0,0];
        let outputIndex = rewards[0].i + (3*rewards[0].j);
        outputO[outputIndex] = 1;
        trainingSetO.push({
            input: input,
            output: outputO
        });

        //X
        rewards.sort(function(a, b){
            return a.rewardX < b.rewardX;
        });
        //the place with the highest reward is at index 0. set all other places to have output 0, and this place to have output 1.
        let outputX = [0,0,0,0,0,0,0,0,0];
        outputIndex = rewards[0].i + (3*rewards[0].j);
        outputX[outputIndex] = 1;

        trainingSetX.push({
            input: input,
            output: outputX
        });
    } else {
        console.warn("Strange, no places to go? " + key + " / " + value);
    }
});

var trainingResultO = trainerO.train(trainingSetO,{
	rate: .01,
//	iterations: 20000,
	iterations: 1,
	error: .005,
	shuffle: true,
	log: 100,
	cost: Trainer.cost.MSE
});
console.log("training result O: " + JSON.stringify(trainingResultO));

var trainingResultX = trainerX.train(trainingSetX,{
	rate: .1,
//	iterations: 20000,
	iterations: 1,
	error: .005,
	shuffle: true,
	log: 1000,
	cost: Trainer.cost.CROSS_ENTROPY
});
console.log("training result X: " + JSON.stringify(trainingResultX));


console.log("place to go: " + myNetworkX.activate([0,0,0,0,0,0,0,0,0])); //expect: [0,0,0,0,1,0,0,0,0]
console.log("place to go: " + myNetworkO.activate([0,0,0,0,1,0,0,0,0])); //expect: [1,0,0,0,0,0,0,0,0]
console.log("did it learn?");


var exportedO = myNetworkO.toJSON();
console.log(exportedO);
var exportedX = myNetworkX.toJSON();
console.log(exportedX);
console.log("exported");
//var imported = Network.fromJSON(exported);