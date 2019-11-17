var FRAMERATE = 30;
var fpb = FRAMERATE/(parseInt(document.getElementById('bpm').value)/60);
var beat_offset = 0;
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
    ['O','2','3',,'4','5',,'6','7','O',]
];
var player_pos = [[1,3]];
var glasses = [0,0,0,0,0,0,0,0,0,0,];
var filled_glasses = 0;
var next_glass_counter = 0;
var score = 0;
var multiplier = 1.0;
var player_glasses = [];
var last_player_move = 0;

function change_bpm(){
    new_bpm = document.getElementById('bpm').value;
    if (new_bpm >= 1){
        fpb = FRAMERATE/(parseInt(new_bpm)/60);
        console.log(`update FRAMERATE:${FRAMERATE} fpb:${fpb}`);
    }
}

function player_move(e){
    gridEl = document.getElementById('game_grid');
    var pressed = e.which || e.keyCode;
    //console.log(pressed)
    if(!key_flag){
        key_flag = true;
        if(valid_flag){
            gridEl.style.color = 'green';
            if(bonus_flag){
                gridEl.style.color = 'orange';                
                if(multiplier < 2.0){
                    multiplier += 0.1;
                }
            }
            if( (pressed == last_player_move) || (player_glasses.length < 4) ){
                switch(pressed){
                    case 87:
                    case 38:
                        if(player_pos[0][0] > 0){
                            if(game_grid[player_pos[0][0]-1][player_pos[0][1]] == null){
                                game_grid[player_pos[0][0]][player_pos[0][1]] = null;
                                player_pos[0][0] -= 1;
                                //game_grid[player_pos[0][0]][player_pos[0][1]] = 'P';
                            }
                            else if(!isNaN(game_grid[player_pos[0][0]-1][player_pos[0][1]])){
                                if(glasses[game_grid[player_pos[0][0]-1][player_pos[0][1]]] != 0){
                                    player_glasses.push(glasses[game_grid[player_pos[0][0]-1][player_pos[0][1]]]);
                                    glasses[game_grid[player_pos[0][0]-1][player_pos[0][1]]] = 0;
                                    filled_glasses -= 1;
                                }
                            }
                            else if(game_grid[player_pos[0][0]-1][player_pos[0][1]] == 'T'){
                                while(player_glasses.length != 0){
                                    score += player_glasses.pop()*10*multiplier;
                                    document.getElementById('player score').innerHTML = score.toFixed(0)
                                }
                            }
                        }
                        break;
                    case 83:
                    case 40:
                        if(player_pos[0][0] < 9){
                            if(game_grid[player_pos[0][0]+1][player_pos[0][1]] == null){
                                game_grid[player_pos[0][0]][player_pos[0][1]] = null;
                                player_pos[0][0] += 1;
                                //game_grid[player_pos[0][0]][player_pos[0][1]] = 'P';
                            }
                            else if(!isNaN(game_grid[player_pos[0][0]+1][player_pos[0][1]])){
                                if(glasses[game_grid[player_pos[0][0]+1][player_pos[0][1]]] != 0){
                                    player_glasses.push(glasses[game_grid[player_pos[0][0]+1][player_pos[0][1]]]);
                                    glasses[game_grid[player_pos[0][0]+1][player_pos[0][1]]] = 0;
                                    filled_glasses -= 1;
                                }
                            }
                            else if(game_grid[player_pos[0][0]+1][player_pos[0][1]] == 'T'){
                                while(player_glasses.length != 0){
                                    score += player_glasses.pop()*10*multiplier;
                                    document.getElementById('player score').innerHTML = score.toFixed(0)
                                }
                            }
                        }
                        break;
                    case 65:
                    case 37:
                        if(player_pos[0][1] > 0){
                            if (game_grid[player_pos[0][0]][player_pos[0][1]-1] == null){
                                game_grid[player_pos[0][0]][player_pos[0][1]] = null;
                                player_pos[0][1] -= 1;
                                //game_grid[player_pos[0][0]][player_pos[0][1]] = 'P';
                        }
                            else if(!isNaN(game_grid[player_pos[0][0]][player_pos[0][1]-1])){
                                if(glasses[game_grid[player_pos[0][0]][player_pos[0][1]-1]] != 0){
                                    player_glasses.push(glasses[game_grid[player_pos[0][0]][player_pos[0][1]-1]]);
                                    glasses[game_grid[player_pos[0][0]][player_pos[0][1]-1]] = 0;
                                    filled_glasses -= 1;
                                }
                            }
                            else if(game_grid[player_pos[0][0]][player_pos[0][1]-1] == 'T'){
                                while(player_glasses.length != 0){
                                    score += player_glasses.pop()*10*multiplier;
                                    document.getElementById('player score').innerHTML = score.toFixed(0)
                                }
                            }
                        }
                        break;
                    case 68:
                    case 39:
                        if(player_pos[0][1] < 9){
                            if (game_grid[player_pos[0][0]][player_pos[0][1]+1] == null){
                                game_grid[player_pos[0][0]][player_pos[0][1]] = null;
                                player_pos[0][1] += 1;
                                //game_grid[player_pos[0][0]][player_pos[0][1]] = 'P';
                            }
                            else if(!isNaN(game_grid[player_pos[0][0]][player_pos[0][1]+1])){
                                if(glasses[game_grid[player_pos[0][0]][player_pos[0][1]+1]] != 0){
                                player_glasses.push(glasses[game_grid[player_pos[0][0]][player_pos[0][1]+1]]);
                                glasses[game_grid[player_pos[0][0]][player_pos[0][1]+1]] = 0;
                                filled_glasses -= 1;
                                }
                            }
                            else if(game_grid[player_pos[0][0]][player_pos[0][1]+1] == 'T'){
                                while(player_glasses.length != 0){
                                    score += player_glasses.pop()*10*multiplier;
                                    document.getElementById('player score').innerHTML = score.toFixed(0)
                                }
                            }
                        }
                        break;
                    default:
                        key_flag = false;
                        gridEl.style.color = 'blue';
                }
                last_player_move = 0;
            }
            else{
                last_player_move = pressed;
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
                    gridEl.style.color = 'red';
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

function display_game_grid(){
    gridEl = document.getElementById('game_grid');
    gridEl.innerHTML = '############<br>';
    for(var i = 0; i<10; ++i){
        gridEl.innerHTML += '#';
        for(var j=0; j<10; ++j){
            if( (i == player_pos[0][0]) && (j == player_pos[0][1]) ){
                gridEl.innerHTML += 'P';
            }
            /*else if( ( (i == x) && (j == y) ) || ( (i == x2) && (j == y2) ) || ( (i==third) && (j==thirdx) ) ){
                gridEl.innerHTML += 'E'
            }*/
            else if(game_grid[i][j] == null){
                gridEl.innerHTML += '&nbsp;'
            }
            else if(!isNaN(game_grid[i][j])){
                gridEl.innerHTML += glasses[game_grid[i][j]];
            }
            else{
                gridEl.innerHTML += game_grid[i][j];
            }
        }
        gridEl.innerHTML += '#<br>';
    }
    gridEl.innerHTML += '############<br>';
}

function generate_upcoming_beats(){
    beat_shelf = [,,,,,'|',];
    //console.log(upcoming_beats)
    for(var i=0; i<upcoming_beats.length; ++i){
        upcoming_beats[i] += 1/fpb;
        if(upcoming_beats[i]>=1){
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
            if(upcoming_beats[i]>=0.8){
                valid_flag=true;
            }
            if(upcoming_beats[i]>=0.9){
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
            gridEl.innerHTML += beat_shelf[i];
        }
    }
    for(var i=5; i>=0; --i){
        if(beat_shelf[i] == null){gridEl.innerHTML += '&nbsp;';}
        else{
            gridEl.innerHTML += beat_shelf[i];
        }
    }
    gridEl.innerHTML += '<br>------------<br>';
    //
}

function game_loop(){
    display_game_grid();
    generate_upcoming_beats();
    onCollisions();
    document.getElementById('player mult').innerHTML = 'x' + multiplier.toFixed(1);
    beat_offset += 1;
    while(beat_offset>=fpb){beat_offset -= fpb;}
    
    setTimeout(function(){game_loop();}, 1000/FRAMERATE);
}

function add_glass() {
    if(filled_glasses<10){
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
    }

}

function reset_conditions() {
    gridEl = document.getElementById('game_grid');
    gridEl.style.color = 'blue';
    key_flag = false;

}
let x2 = Math.floor(Math.random()* 4) + 2;
let y2 = Math.floor(Math.random()* game_grid[x2].length);
let x = Math.floor(Math.random()* 4) + 2;
let y = Math.floor(Math.random()* game_grid[x].length);
if (x == x2){
    if (x<=6){
        x =x+1;
    }
    else{
        x2=x2+1;
    }
}
var beats = 0;
//range 2-6
function onCollisions() {
    gridEl = document.getElementById('game_grid');
        if ( beats == 25){
            beats = 0;
            if (y == 10) {
                y = 0;
            }
            else {
                y =y+1;
            }
            game_grid[x][y] ="E";
            game_grid[x][y-1]= null;
        } 
        else if (beats == 10){
            beats = beats+1;
           if (y2 == 10) {
               y2 = 0;
           }
           else {
            y2 =y2+1;
        }
            game_grid[x2][y2] ="D";
            game_grid[x2][y2-1]= null;
        }
        else {
            beats = beats+1;
        }
}

function attack() {
    if (player_pos == game_grid[x][y] || player_pos == game_grid[x2][y2]){
        
    }

}

console.log(`start FRAMERATE:${FRAMERATE} fpb:${fpb}`);
document.onkeydown = player_move;


setTimeout(function(){game_loop();}, 1000/FRAMERATE);
