var FRAMERATE = 30;
var fpb = FRAMERATE/(document.getElementById('bpm').value/60);
var beat_offset = 0;
var game_running = false;
var valid_flag = false;
var bonus_flag =false;
var key_flag = false;
var upcoming_beats = [];
var beat_shelf = [,,,,,'|',];
var game_grid = [
    ['T',,,'T',,,'T',,,'T',],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    ['0',,,,,,,,,'9',],
    ['1',,,,,,,,,'8',],
    ['O','2','3','O','4','5','O','6','7','O',]
];
var player_pos = [[1,0],[1,3],[1,6],[1,9],];
var glasses = [0,0,0,0,0,0,0,0,0,0];
var filled_glasses = 0;
var next_glass_counter = 0;
var score = 0;
var multiplier = 1.0;
var player_glasses = [[],[],[],[],];
var last_player_move = [0,0,0,0,];
// if(player_num == 0){
//     let x2 = Math.floor(Math.random()* 4) + 2;
//     let y2 = Math.floor(Math.random()* 10);
//     let x = Math.floor(Math.random()* 4) + 2;
//     let y = Math.floor(Math.random()* 10);
//     let third = Math.floor(Math.random()*1)+7;
//     let thirdx = Math.floor(Math.random()*7)+2;
// }

const socket = io('/game')
socket.emit("join", room)
socket.on("updatePos", ({player, pos}) => {
    player_pos[player] = pos
})
socket.on("updateEnemies", data => {
    [x, y, x2, y2, thirdx, third] = data;
})
socket.on("updateBpm", data => {
    document.getElementById('bpm').value = data
    fbp = FRAMERATE/data/60;
})
socket.on("updateGlasses", (data) => {
    glasses = data.glasses
    filled_glasses = data.filled_glasses
})
socket.on("updateFilledGlasses", data => {
    filled_glasses = data
})
var beats = 0;

function change_bpm(){
    new_bpm = document.getElementById('bpm').value;
    if (new_bpm >= 1){
        socket.emit('newBpm', {data: new_bpm, room})
        fpb = FRAMERATE/new_bpm/60;
        console.log(`update FRAMERATE:${FRAMERATE} fpb:${fpb}`);
    }
}

function game_end(){
    game_running = false;
    if (num_players > 1) { //multiplayer
        document.getElementById('multiplayerexit').style.visibility = 'visible';
    }
    console.log(document.getElementById('player score'));
    document.getElementById('scorenum').value = document.getElementById('player score').innerHTML;
}

function player_move(num, e){
    gridEl = document.getElementById('game_grid');
    var pressed = e.which || e.keyCode;
    //console.log(pressed)
    if(game_running){
        if(!key_flag){
            key_flag = true;
            if(valid_flag){
                //gridEl.style.color = 'green';
                document.getElementById('hit').innerHTML = "GREAT";
                document.getElementById('hit').style.color = 'green';
                if(bonus_flag){
                    //gridEl.style.color = 'orange';
                    document.getElementById('hit').innerHTML = "OKAY";
                    document.getElementById('hit').style.color = 'orange';
                    if(multiplier < 2.0){
                        multiplier += 0.1;
                    }
                }
                if( (pressed == last_player_move[num]) || (player_glasses[num].length < 5) ){
                    var hit_flag = false;
                    switch(pressed){
                        case 87:
                        case 38:
                            if(player_pos[num][0] > 0){
                                for(i=1; i<num_players;i++){
                                    if(player_pos[num][0]-1 == player_pos[i%4][0] && player_pos[num][1] == player_pos[i%4][1]){
                                        hit_flag = true;
                                        if(player_glasses[i].length > 0){player_glasses[i].pop();}
                                        if(player_glasses[num].length > 0){player_glasses[num].pop();}
                                    }
                                }
                                if(hit_flag){null;}
                                else if(game_grid[player_pos[num][0]-1][player_pos[num][1]] == null){
                                    game_grid[player_pos[num][0]][player_pos[num][1]] = null;
                                    player_pos[num][0] -= 1;
                                    socket.emit('newPos', {data: {player: num, pos: player_pos[num]}, room})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                                }
                                else if(!isNaN(game_grid[player_pos[num][0]-1][player_pos[num][1]])){
                                    if(glasses[game_grid[player_pos[num][0]-1][player_pos[num][1]]] != 0 && player_glasses[num].length < 9){
                                        player_glasses[num].push(glasses[game_grid[player_pos[num][0]-1][player_pos[num][1]]]);
                                        glasses[game_grid[player_pos[num][0]-1][player_pos[num][1]]] = 0;
                                        filled_glasses -= 1;
                                        socket.emit('newGlasses', {data: {filled_glasses, glasses}, room})
                                    }
                                }
                                else if(player_pos[num][0]-1 == 0 && player_pos[num][1] == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        document.getElementById('player score').innerHTML = score.toFixed(0)
                                    }
                                }
                            }
                            break;
                        case 83:
                        case 40:
                            if(player_pos[num][0] < 9){
                                for(i=1; i<num_players;i++){
                                    if(player_pos[num][0]+1 == player_pos[i%4][0] && player_pos[num][1] == player_pos[i%4][1]){
                                        hit_flag = true;
                                        if(player_glasses[i].length > 0){player_glasses[i].pop();}
                                        if(player_glasses[num].length > 0){player_glasses[num].pop();}
                                    }
                                }
                                if(hit_flag){null;}
                                else if(game_grid[player_pos[num][0]+1][player_pos[num][1]] == null){
                                    game_grid[player_pos[num][0]][player_pos[num][1]] = null;
                                    player_pos[num][0] += 1;
                                    socket.emit('newPos', {data: {player: num, pos: player_pos[num]}, room})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                                }
                                else if(!isNaN(game_grid[player_pos[num][0]+1][player_pos[num][1]])){
                                    if(glasses[game_grid[player_pos[num][0]+1][player_pos[num][1]]] != 0 && player_glasses[num].length < 9){
                                        player_glasses[num].push(glasses[game_grid[player_pos[num][0]+1][player_pos[num][1]]]);
                                        glasses[game_grid[player_pos[num][0]+1][player_pos[num][1]]] = 0;
                                        filled_glasses -= 1;
                                        socket.emit('newGlasses', {data: {filled_glasses, glasses}, room})
                                    }
                                }
                                else if(player_pos[num][0]+1 == 0 && player_pos[num][1] == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        document.getElementById('player score').innerHTML = score.toFixed(0)
                                    }
                                }
                            }
                            break;
                        case 65:
                        case 37:
                            if(player_pos[num][1] > 0){
                                for(i=1; i<num_players;i++){
                                    if(player_pos[num][0] == player_pos[i%4][0] && player_pos[num][1]-1 == player_pos[i%4][1]){
                                        hit_flag = true;
                                        if(player_glasses[i].length > 0){player_glasses[i].pop();}
                                        if(player_glasses[num].length > 0){player_glasses[num].pop();}
                                    }
                                }
                                if(hit_flag){null;}
                                else if (game_grid[player_pos[num][0]][player_pos[num][1]-1] == null){
                                    game_grid[player_pos[num][0]][player_pos[num][1]] = null;
                                    player_pos[num][1] -= 1;
                                    socket.emit('newPos', {data: {player: num, pos: player_pos[num]}, room})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                            }
                                else if(!isNaN(game_grid[player_pos[num][0]][player_pos[num][1]-1])){
                                    if(glasses[game_grid[player_pos[num][0]][player_pos[num][1]-1]] != 0 && player_glasses[num].length < 9){
                                        player_glasses[num].push(glasses[game_grid[player_pos[num][0]][player_pos[num][1]-1]]);
                                        glasses[game_grid[player_pos[num][0]][player_pos[num][1]-1]] = 0;
                                        filled_glasses -= 1;
                                        socket.emit('newGlasses', {data: {filled_glasses, glasses}, room})
                                    }
                                }
                                else if(player_pos[num][0] == 0 && player_pos[num][1]-1 == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        document.getElementById('player score').innerHTML = score.toFixed(0)
                                    }
                                }
                            }
                            break;
                        case 68:
                        case 39:
                            if(player_pos[num][1] < 9){
                                for(i=1; i<num_players;i++){
                                    if(player_pos[num][0] == player_pos[i%4][0] && player_pos[num][1]+1 == player_pos[i%4][1]){
                                        hit_flag = true;
                                        if(player_glasses[i].length > 0){player_glasses[i].pop();}
                                        if(player_glasses[num].length > 0){player_glasses[num].pop();}
                                    }
                                }
                                if(hit_flag){null;}
                                else if (game_grid[player_pos[num][0]][player_pos[num][1]+1] == null){
                                    game_grid[player_pos[num][0]][player_pos[num][1]] = null;
                                    player_pos[num][1] += 1;
                                    socket.emit('newPos', {data: {player: num, pos: player_pos[num]}, room})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                                }
                                else if(!isNaN(game_grid[player_pos[num][0]][player_pos[num][1]+1])){
                                    if(glasses[game_grid[player_pos[num][0]][player_pos[num][1]+1]] != 0 && player_glasses[num].length < 9){
                                    player_glasses[num].push(glasses[game_grid[player_pos[num][0]][player_pos[num][1]+1]]);
                                    glasses[game_grid[player_pos[num][0]][player_pos[num][1]+1]] = 0;
                                    filled_glasses -= 1;
                                    socket.emit('newGlasses', {data: {filled_glasses, glasses}, room})
                                    }
                                }
                                else if(player_pos[num][0] == 0 && player_pos[num][1]+1 == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        document.getElementById('player score').innerHTML = score.toFixed(0)
                                    }
                                }
                            }
                            break;
                        default:
                            key_flag = false;
                            //gridEl.style.color = 'blue';
                            document.getElementById('hit').innerHTML = "READY";
                            document.getElementById('hit').style.color = 'blue';
                    }
                    last_player_move[num] = 0;
                }
                else{
                    last_player_move[num] = pressed;
                }

                setTimeout(function(){reset_conditions();}, 1000/FRAMERATE*fpb*2/3);
            }
            else{
                switch(pressed){
                    case 37:
                    case 38:
                    case 39:
                    case 40:
                    case 65:
                    case 68:
                    case 83:
                    case 87:
                        //gridEl.style.color = 'red';
                        document.getElementById('hit').innerHTML = "MISS";
                        document.getElementById('hit').style.color = 'red';
                        multiplier = 1.0;
                        break;
                    default:
                        key_flag = false;
                }
                setTimeout(function(){reset_conditions();}, 1000/FRAMERATE*fpb*2/3);
            }
        }
        e.preventDefault();
    }
}

function display_held_items(){
  var displaystring = "";
  for(var i = 0; i < player_glasses[player_num].length; i++){
    if(player_glasses[player_num][i] == 1){
        displaystring += '<img src="/assets/drink1.png">';
    } else if(player_glasses[player_num][i] == 2){
        displaystring += '<img src="/assets/drink2.png">';
    }else{
        displaystring += '<img src="/assets/drink3.png">';
    }
  }
  document.getElementById('items').innerHTML = displaystring;
}

function display_game_grid(){
    gridEl = document.getElementById('game_grid');
    gridEl.innerHTML = '############<br>';
    for(var i = 0; i<10; ++i){
        gridEl.innerHTML += '#';
        for(var j=0; j<10; ++j){
            var filled_flag = false;
            for(var num = 0; num < num_players; num++){
                if( (i == player_pos[num][0]) && (j == player_pos[num][1]) && (!filled_flag)){
                    var playerimages = ['<img src="/assets/player1.png">', '<img src="/assets/player2.png">', '<img src="/assets/player3.png">', '<img src="/assets/player4.png">'];
                    gridEl.innerHTML += playerimages[num];
                    filled_flag = true;
                }
            }
            if(filled_flag){null;}
            else if( ( (i == x) && (j == y) ) || ( (i == x2) && (j == y2) ) || ( (i==third) && (j==thirdx) ) ){
              if(j == y2) gridEl.innerHTML += '<img src="/assets/enemy1.gif">';
              else gridEl.innerHTML += '<img src="/assets/enemy2.gif">';
            }
            else if(game_grid[i][j] == null){
              gridEl.innerHTML += '&nbsp;'
            }
            else if(!isNaN(game_grid[i][j])){
              if(glasses[game_grid[i][j]] == 1){
                gridEl.innerHTML += '<img src="/assets/drink1.png">';
              }
              else if(glasses[game_grid[i][j]] == 2){
                gridEl.innerHTML += '<img src="/assets/drink2.png">';
              }
              else if(glasses[game_grid[i][j]] == 3){
                gridEl.innerHTML += '<img src="/assets/drink3.png">';
              }
              else gridEl.innerHTML += 0;//glasses[game_grid[i][j]];
            }
            else {
                gridEl.innerHTML += game_grid[i][j];
            }
        }
        gridEl.innerHTML += '#<br>';
    }
    gridEl.innerHTML += '############';
}

function generate_upcoming_beats(){
    beat_shelf = [,,,,,,];
    //console.log(upcoming_beats)
    for(var i=0; i<upcoming_beats.length; ++i){
        upcoming_beats[i] += 1/FRAMERATE;
        if(upcoming_beats[i]>=1){
            onCollisions();
            upcoming_beats.shift();
            --i;
            valid_flag = false;
            bonus_flag = false;
            if(!key_flag){
                multiplier = 1.0
            }
            if(next_glass_counter == 3){
                add_glass();
                next_glass_counter = 0;
            }
            else{
                next_glass_counter += 1;
            }
        }

        else{
            if(upcoming_beats[i]>=0.7){
                valid_flag=true;
            }
            if(upcoming_beats[i]>=0.85){
                bonus_flag=true;
            }
            var temp = parseInt(upcoming_beats[i]*6)
            if(temp<6){beat_shelf[temp] = 0}
        }
    }
    if(beat_offset<1){
        upcoming_beats.push(0);
        beat_shelf[0]=0;
    }
    //console.log(beat_shelf)
    // This block can be removed once graphics are moved to a continuous game space
    gridEl = document.getElementById('game_grid');
    gridEl.innerHTML += '<br>------------<br>'
    for(var i=0; i<6; ++i){
        if(beat_shelf[i] == null){gridEl.innerHTML += '&nbsp;';}
        else{
            //gridEl.innerHTML += beat_shelf[i];
            gridEl.innerHTML += '<img src="/assets/beat.png">';
        }
    }
    for(var i=5; i>=0; --i){
        if(beat_shelf[i] == null){gridEl.innerHTML += '&nbsp;';}
        else{
            //gridEl.innerHTML += beat_shelf[i];
            gridEl.innerHTML += '<img src="/assets/beat.png">';
        }
    }
    gridEl.innerHTML += '<br>------------<br>';
    //
}

function game_loop() {
    
    
    attack();
    display_game_grid();
    generate_upcoming_beats();
    display_held_items();
    document.getElementById('player mult').innerHTML = 'x' + multiplier.toFixed(1);
    beat_offset += 1;
    while (beat_offset>=fpb){beat_offset -= fpb;}
    if(game_running){
        setTimeout(function(){game_loop();}, 1000/FRAMERATE);
    }
}

function add_glass() {
    if(player_num == 0 && filled_glasses<10){
        glass_pos = parseInt(Math.random()*10);
        while( glasses[glass_pos] != 0){
            glass_pos = (glass_pos+1) % 10
        }
        glass_value = Math.random();
        if(glass_value<=0.5){
            glasses[glass_pos] = 1;
        }
        else if(glass_value<=0.9){
            glasses[glass_pos] = 2;
        }
        else {
            glasses[glass_pos] = 3;
        }
        filled_glasses += 1;
        socket.emit('newGlasses', {data: {filled_glasses, glasses}, room})
    }

}

function reset_conditions() {
    gridEl = document.getElementById('game_grid');
    //gridEl.style.color = 'blue';
    document.getElementById('hit').innerHTML = "READY";
    document.getElementById('hit').style.color = 'blue';
    key_flag = false;

}

function onCollisions() {
    gridEl = document.getElementById('game_grid');
    if(player_num == 0){
        if (y2 == 10) {
            y2 = 0;
        }
        else {
            y2 =y2+1;
        }
        /*game_grid[x2][y2] ="E";
        game_grid[x2][y2-1]= null;*/
        if (thirdx == 8){
            game_grid[third][thirdx]=null;
            thirdx = 1;
        }
        else{
            thirdx = thirdx +1;
        }
        /*game_grid[third][thirdx] ="E";
        if (thirdx != 1){
            game_grid[third][thirdx-1]= null;
        }*/

        if ( beats == 1){
            beats = 0;
            if (y == 10) {
                y = 0;
            }
            else {
                y =y+1;
            }
            /*game_grid[x][y] ="E";
            game_grid[x][y-1]= null;*/
        }
        else {
            beats = beats+1;
        }
        socket.emit("newEnemies", {data: [x, y, x2, y2, thirdx, third], room})
    }
}

function attack() {
  //  console.log(player_pos[i], [x,y])
    for(i=0; i<4; i++){
        if (player_pos[i][0] == x && player_pos[i][1] == y){
            player_pos[i] = [x+1, y];
            if(player_glasses[i].length > 0){player_glasses[i].pop();}
        //  console.log('fight me');
        }
        if (player_pos[i][0] == x2 && player_pos[i][1] == y2){
            player_pos[i] = [x2+1,y2];
            if(player_glasses[i].length > 0){player_glasses[i].pop();}
        }
        if (player_pos[i][0] == third && player_pos[i][1] == thirdx){
            player_pos[i] = [third+1 ,thirdx];
            if(player_glasses[i].length > 0){player_glasses[i].pop();}
        }
    }
}

console.log(`start FRAMERATE:${FRAMERATE} fpb:${fpb}`);
document.onkeydown = function(e){player_move(player_num, e)};

game_loop();
//setTimeout(function(){game_loop(); setTimeout(function{game_end();}, 1000*duration)}, 1000/FRAMERATE);
