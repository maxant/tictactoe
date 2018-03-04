//https://medium.freecodecamp.org/how-to-create-a-neural-network-in-javascript-in-only-30-lines-of-code-343dafc50d49
const { Layer, Network } = window.synaptic;
var inputLayerO = new Layer(9); //O=-1, -=0, X=1
var hiddenLayerO = new Layer(9); //TODO tune this
var outputLayerO = new Layer(9); //where to move to; -1 is best move for O, 1 is best move for X. raster, ie 0=(0,0), 4=(1,1), etc.
var inputLayerX = new Layer(9); //O=-1, -=0, X=1
var hiddenLayerX = new Layer(9); //TODO tune this
var outputLayerX = new Layer(9); //where to move to; -1 is best move for O, 1 is best move for X. raster, ie 0=(0,0), 4=(1,1), etc.

inputLayerO.project(hiddenLayerO);
hiddenLayerO.project(outputLayerO);
inputLayerX.project(hiddenLayerX);
hiddenLayerX.project(outputLayerX);
var myNetworkO = new Network({
 input: inputLayerO,
 hidden: [hiddenLayerO],
 output: outputLayerO
});
var myNetworkX = new Network({
 input: inputLayerX,
 hidden: [hiddenLayerX],
 output: outputLayerX
});

// train the network
var learningRate = .3; //TODO tune this
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

    let totalRewardX = 0;
    let totalRewardO = 0;
    rewards.forEach(function(cell){
        totalRewardX += cell.rewardX;
        totalRewardO += cell.rewardO;
    });

    let outputX = [];
    let outputO = [];
    rewards.forEach(function(cell){
        let outputIndex = cell.i + (3*cell.j);
        outputX[outputIndex] = cell.rewardX / totalRewardX;
        outputO[outputIndex] = cell.rewardO / totalRewardO;
    });

    myNetworkO.activate(input);
    myNetworkO.propagate(learningRate, outputO);
    myNetworkX.activate(input);
    myNetworkX.propagate(learningRate, outputX);
});

console.log("place to go: " + myNetworkO.activate([0,0,0,0,0,0,0,0,0])); //[0,0,0,0,1,0,0,0,0]
console.log("did it learn?");


var exportedO = myNetworkO.toJSON();
console.log(exportedO);
var exportedX = myNetworkX.toJSON();
console.log(exportedX);
console.log("exported");
//var imported = Network.fromJSON(exported);