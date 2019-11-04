var FRAMERATE = 30;
var fpb = FRAMERATE/(parseInt(document.getElementById('bpm').value)/60);
var beat_offset = 0;
var upcoming_beats = [];
var temp_beat_shelf = [,,,,,];
var game_grid = [
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,]
];

function change_bpm(){
    fpb = FRAMERATE/(parseInt(document.getElementById('bpm').value)/60);
    console.log(`update FRAMERATE:${FRAMERATE} fpb:${fpb}`);
}

function display_game_grid(){
    gridEl = document.getElementById('game_grid');
    gridEl.innerHTML = '############<br>';
    for(var i = 0; i<10; ++i){
        gridEl.innerHTML += '#';
        for(var j=0; j<10; ++j){
            if(game_grid[i][j] == null){
                gridEl.innerHTML += '&nbsp;'
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
    temp_beat_shelf = [,,,,,];

    for(var i=0; i<upcoming_beats.length; ++i){
        upcoming_beats[i] += 1/fpb;
        if(upcoming_beats[i]>=1){
            upcoming_beats.shift();
            --i;
        }
        
        else{
            var temp = parseInt(upcoming_beats[i]*6)
            if(temp<5){temp_beat_shelf[temp] = 0}
        }
    }
    if(beat_offset<1){
        upcoming_beats.push(0);
        temp_beat_shelf[0]=0;
    }
    //console.log(temp_beat_shelf)
    // This block can be removed once graphics are moved to a continuous game space
    gridEl = document.getElementById('game_grid');
    gridEl.innerHTML += '<br>------------<br>'
    for(var i=0; i<5; ++i){
        if(temp_beat_shelf[i] == null){gridEl.innerHTML += '&nbsp;';}
        else{
            gridEl.innerHTML += '0';
        }
    }
    gridEl.innerHTML += '||';
    for(var i=4; i>=0; --i){
        if(temp_beat_shelf[i] == null){gridEl.innerHTML += '&nbsp;';}
        else{
            gridEl.innerHTML += '0';
        }
    }
    gridEl.innerHTML += '<br>------------<br>'
    //
}

function game_loop(){
    //console.log("running");
    display_game_grid();
    generate_upcoming_beats();
    /*
    temp = beat_offset;
    for(var i = 1; i<6; ++i){
        if (Math.round(temp/fpb) >= i){
            console.log(Math.round(temp*6/fpb))
            gridEl.innerHTML += '0';
        }
        else {
            gridEl.innerHTML += '&nbsp;';
            
            console.log(Math.round((temp*6)/fpb))
        }
    }
    gridEl.innerHTML += '||';
    temp = beat_offset;
    for(var i = 5; 1<=i; --i){
        if ((i+temp+10)>=fpb){
            temp -= fpb
            gridEl.innerHTML += '0';
        }
        else {
            gridEl.innerHTML += '&nbsp;';
        }
    }
    gridEl.innerHTML += '<br>------------<br>';
    //console.log(gridEl.innerHTML)
    */
    beat_offset += 1;
    while(beat_offset>=fpb){beat_offset -= fpb;}
    //console.log(beat_offset)
    
    setTimeout(function(){game_loop();}, 1000/FRAMERATE);
}

console.log(`start FRAMERATE:${FRAMERATE} fpb:${fpb}`);

setTimeout(function(){game_loop();}, 1000/FRAMERATE);
