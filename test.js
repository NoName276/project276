process.env.DATABASE_URL = "postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
var request = require("request"),
    assert = require('assert'),
    app = require("./index.js"),
    //game = require('./public/scripts/game.js')
    base_url = "http://localhost:5000/";

    
chai = require("chai");
chaiHttp = require('chai-http');
chai.use(require('chai-dom'));
let should = chai.should();
chai.use(chaiHttp);

chai.use(chaiHttp);
const { expect } = chai;

var jsdom = require('mocha-jsdom')

// <GAME FUNCTIONS>
function game_end(){
    game_running = false;
}

function player_move(num, e){
    //gridEl = document.getElementById('game_grid');
    var pressed = e.which || e.keyCode;
    //console.log(pressed)
    if(game_running){
        if(!key_flag){
            key_flag = true;
            if(valid_flag){
                //gridEl.style.color = 'green';
                if(bonus_flag){
                    //gridEl.style.color = 'orange';
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
                                    //socket.emit('newPos', {player: num, pos: player_pos[num]})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                                }
                                else if(!isNaN(game_grid[player_pos[num][0]-1][player_pos[num][1]])){
                                    if(glasses[game_grid[player_pos[num][0]-1][player_pos[num][1]]] != 0 && player_glasses[num].length < 8){
                                        player_glasses[num].push(glasses[game_grid[player_pos[num][0]-1][player_pos[num][1]]]);
                                        glasses[game_grid[player_pos[num][0]-1][player_pos[num][1]]] = 0;
                                        filled_glasses -= 1;
                                        //socket.emit('newGlasses', {filled_glasses, glasses})
                                    }
                                }
                                else if(player_pos[num][0]-1 == 0 && player_pos[num][1] == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        //document.getElementById('player score').innerHTML = score.toFixed(0)
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
                                    //socket.emit('newPos', {player: num, pos: player_pos[num]})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                                }
                                else if(!isNaN(game_grid[player_pos[num][0]+1][player_pos[num][1]])){
                                    if(glasses[game_grid[player_pos[num][0]+1][player_pos[num][1]]] != 0 && player_glasses[num].length < 8){
                                        player_glasses[num].push(glasses[game_grid[player_pos[num][0]+1][player_pos[num][1]]]);
                                        glasses[game_grid[player_pos[num][0]+1][player_pos[num][1]]] = 0;
                                        filled_glasses -= 1;
                                        //socket.emit('newGlasses', {filled_glasses, glasses})
                                    }
                                }
                                else if(player_pos[num][0]+1 == 0 && player_pos[num][1] == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        //document.getElementById('player score').innerHTML = score.toFixed(0)
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
                                    //socket.emit('newPos', {player: num, pos: player_pos[num]})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                            }
                                else if(!isNaN(game_grid[player_pos[num][0]][player_pos[num][1]-1])){
                                    if(glasses[game_grid[player_pos[num][0]][player_pos[num][1]-1]] != 0 && player_glasses[num].length < 8){
                                        player_glasses[num].push(glasses[game_grid[player_pos[num][0]][player_pos[num][1]-1]]);
                                        glasses[game_grid[player_pos[num][0]][player_pos[num][1]-1]] = 0;
                                        filled_glasses -= 1;
                                        //socket.emit('newGlasses', {filled_glasses, glasses})
                                    }
                                }
                                else if(player_pos[num][0] == 0 && player_pos[num][1]-1 == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        //document.getElementById('player score').innerHTML = score.toFixed(0)
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
                                    //socket.emit('newPos', {player: num, pos: player_pos[num]})
                                    //game_grid[player_pos[num][0]][player_pos[num][1]] = 'P';
                                }
                                else if(!isNaN(game_grid[player_pos[num][0]][player_pos[num][1]+1])){
                                    if(glasses[game_grid[player_pos[num][0]][player_pos[num][1]+1]] != 0 && player_glasses[num].length < 8){
                                    player_glasses[num].push(glasses[game_grid[player_pos[num][0]][player_pos[num][1]+1]]);
                                    glasses[game_grid[player_pos[num][0]][player_pos[num][1]+1]] = 0;
                                    filled_glasses -= 1;
                                    //socket.emit('newGlasses', {filled_glasses, glasses})
                                    }
                                }
                                else if(player_pos[num][0] == 0 && player_pos[num][1]+1 == 3*num){
                                    while(player_glasses[num].length != 0){
                                        score += player_glasses[num].pop()*10*multiplier;
                                        //document.getElementById('player score').innerHTML = score.toFixed(0)
                                    }
                                }
                            }
                            break;
                        default:
                            key_flag = false;
                            //gridEl.style.color = 'blue';
                            //document.getElementById('hit').innerHTML = "READY";
                            //document.getElementById('hit').style.color = 'blue';
                    }
                    last_player_move[num] = 0;
                }
                else{
                    last_player_move[num] = pressed;
                }

                //setTimeout(function(){reset_conditions();}, 1000/FRAMERATE*fpb*2/3);
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
                        //document.getElementById('hit').innerHTML = "MISS";
                        //document.getElementById('hit').style.color = 'red';
                        multiplier = 1.0;
                        break;
                    default:
                        key_flag = false;
                }
                //setTimeout(function(){reset_conditions();}, 1000/FRAMERATE*fpb*2/3);
            }
        }
        e.preventDefault();
    }
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
}
    
    function game_loop() {
    /*document.getElementById('multiplayerexit').style.visibility = 'hidden';
    document.getElementById('singleplayereturn').style.visibility = 'hidden';*/
    attack();
    display_game_grid();
    generate_upcoming_beats();
    display_held_items();
    //document.getElementById('player mult').innerHTML = 'x' + multiplier.toFixed(1);
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
        //socket.emit('newGlasses', {filled_glasses, glasses})
    }

}

function reset_conditions() {
    /*gridEl = document.getElementById('game_grid');
    //gridEl.style.color = 'blue';
    document.getElementById('hit').innerHTML = "READY";
    document.getElementById('hit').style.color = 'blue';*/
    key_flag = false;

}

function onCollisions() {
    //gridEl = document.getElementById('game_grid');
    if(player_num == 0){
        if (y2 == 10) {
            y2 = 0;
        }
        else {
            y2 =y2+1;
        }
        game_grid[x2][y2] ="E";
        game_grid[x2][y2-1]= null
        if (thirdx == 8){
            game_grid[third][thirdx]=null;
            thirdx = 1;
        }
        else{
            thirdx = thirdx +1;
        }
        game_grid[third][thirdx] ="E";
        if (thirdx != 1){
            game_grid[third][thirdx-1]= null;
        }
        

        if ( beats == 1){
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
        else {
            beats = beats+1;
        }
        //socket.emit("newEnemies", [x, y, x2, y2, thirdx, third])
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
//setTimeout(function(){game_loop(); setTimeout(function{game_end();}, 1000*duration)}, 1000/FRAMERATE);
// <GAME FUNCTIONS/> 


//done

describe("Front Page Running?", function () {
        it("returns status code 200", function (done) {
            request.get(base_url, function (error, response, body) {
                //expect(response.statusCode).toBe(200);
                assert.equal(200, response.statusCode);
                done();
            });
        });
});

//done
describe("404 page", function () {
    it('Status 404 on unreal page', (done) => {
        chai.request(app)
            .get(`/club/testing`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(404);
             done();
            });
    });
});

//done
describe("Register", function () {
    it('delete user to test "new user" (in case made before test)', (done) => {
        let person = {
            username: "testingregister",
            password: "x"
        }
        chai.request(app)
            .post(`/BobbyC/deleted`)
            .send(person)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                done();
            });
    });

    it('With new user', (done) => {
        let person = {
            username: "testingregister",
            password: "x"
        }
        chai.request(app)
            .post(`/club/reg`)
            .send(person)
            .end(function (err, res) {
                
             
                expect(res.status).to.be.eq(200);
                res.text.should.include('registration successful')
                done();
            });
    });
    it('With old user', (done) => {
        let person = {
            username: "BobbyC",
            password: "cmpt276"
        }
        chai.request(app)
            .post(`/club/reg`)
            .send(person)
            .end(function (err, res) {
              
                expect(res.status).to.be.eq(200);
                res.text.should.include('Username taken.');
                done();
            });
    });
});

//done
describe("LogIn and LogOut", function () {
    describe("Log In Tests", function () {
        it('delete user to test "not registered" (in case made before test)', (done) => {
            let person = {
                username: "testinglogin",
                password: "x"
            }
            chai.request(app)
                .post(`/BobbyC/deleted`)
                .send(person)
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    done();
                });
        });
        it("Login with not registered credentials", function (done) {
            let person = {
                username: "testinglogin",
                password: "x"
            }
            chai.request(app)
                .post("/club/login")
                .send(person)
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Invalid Username or Password.')
                    done();
                });
        })
        it("Login with registered credentials, wrong password", function (done) {
            let person = {
                username: "BobbyC",
                password: "C"
            }
            chai.request(app)
                .post("/club/login")
                .send(person)
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Invalid Username or Password.')
                    done();
                });
        })
        it("Login with registered credentials, wrong username for the password", function (done) {
            let person = {
                username: "BobbyC",
                password: "x"
            }
            chai.request(app)
                .post("/club/login")
                .send(person)
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Invalid Username or Password.')
                    done();
                });
        })
        it("Login with registered credentials, correct, admin", function (done) {
            let person = {
                username: "BobbyC",
                password: "cmpt276"
            }
            chai.request(app)
                .post("/club/login")
                .send(person)
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Welcome, Admin User BobbyC')
                    res.text.should.include('LOG OUT')
                    done();
                });
        })
        it("Login with registered credentials, correct, normaluser", function (done) {
            let person = {
                username: "testingregister",
                password: "x"
            }
            chai.request(app)
                .post("/club/login")
                .send(person)
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Welcome, testingregister! This is your home page, where you can view your current stats, the global leaderboard, as well as start a new game!')
                    res.text.should.include('LOG OUT')
                    done();
                });
        })
    });

    describe("Log Out Tests", function () {
        it("Logout Normal", function (done) {
            chai.request(app)
                .get("/club")
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Login')
                    res.text.should.include('Register')
                    done();
                });
        })
        it("Logout Admin", function (done) {
            chai.request(app)
                .get("/club")
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include('Login')
                    res.text.should.include('Register')
                    done();
                });
        })
    });
});

//done (?)
describe("Stats and Leaderboard", function () {
    describe("Stats", function () {
        it("All Stats being shown?", function (done) {
            chai.request(app)
            .get("/club/BobbyC/stats")
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    //console.log(res.text);
                    res.text.should.include("Welcome, BobbyC! Here you can view all your personal stats!");
                    res.text.should.include("Leaderboard Rank");
                    res.text.should.include("Games Played");
                    res.text.should.include("Games Won");
                    res.text.should.include("Games Lost");
                    res.text.should.include("Games Drawn");
                    res.text.should.include("Total Points");
                    res.text.should.include("1"); //rank
                    res.text.should.include("150"); //high score
                    res.text.should.include("0"); //games played/drawn/lost
                    done();
                });
        })
        it("Top Player Stats Color", function (done) {
            chai.request(app)
                .get("/club/BobbyC/stats")
                .end(function (err, res) {
                    //console.log(res.text);
                    res.text.should.include("#D4AF37");
                    expect(res.status).to.be.eq(200);
                    done();
                });
        })
        it("2nd Player Stats Color", function (done) {
            chai.request(app)
                .get("/club/Quiette/stats")
                .end(function (err, res) {
                    //console.log(res.text);
                    res.text.should.include("#C0C0C0");
                    expect(res.status).to.be.eq(200);
                    done();
                });
        })
        it("3rd Player Stats Color", function (done) {
            chai.request(app)
                .get("/club/hi/stats")
                .end(function (err, res) {
                    //console.log(res.text);
                    res.text.should.include("#cd7f32");
                    expect(res.status).to.be.eq(200);
                    done();
                });
        })
        it("4th + Player Stats Color", function (done) {
            chai.request(app)
                .get("/club/jen/stats")
                .end(function (err, res) {
                    //console.log(res.text);
                    res.text.should.include("white");
                    expect(res.status).to.be.eq(200);
                    done();
                });
        })
        it("Stats update post-game", function (done) {
            chai.request(app)
                .post(`/club/testingregister/updatingstats`)
                .send({ scorenum: 15 })
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    res.text.should.include("Log Out"); //back to homepage
                });
        })
    });
 
    describe("Leaderboard", function () {
        it("Normal Leaderboard/Top Ten", function (done) {
            chai.request(app)
                .get("/club/Quiette/leaderboard")
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    //console.log(res.text);
                    res.text.should.include("Welcome, Quiette. Here is the Leaderboard:"); //in leaderboard
                    res.text.should.include("BobbyC"); //holds top player
                    res.text.should.include("jen");//holds 10th place player or lowest player if less than ten 
                    res.text.should.include("Here is your standing:");
                    res.text.should.include("Quiette"); //holds self in table
                    done();
                });
        })
        it("Admin Leaderboard/All Users", function (done) {
            chai.request(app)
                .get("/club/admin/BobbyC/leaderboard")
                .end(function (err, res) {
                    expect(res.status).to.be.eq(200);
                    //console.log(res.data);
                    res.text.should.include("Here is the Master Leaderboard:");
                    res.text.should.include("Username");
                    res.text.should.include("Rank");
                    res.text.should.include("Played");
                    res.text.should.include("Won");
                    res.text.should.include("Lost");
                    res.text.should.include("Drawn");
                    res.text.should.include("High Score");
                    res.text.should.include("Total");
                    res.text.should.include("BobbyC");
                    res.text.should.include("testingregister");
                    res.text.should.include("Quiette");
                    res.text.should.include("jen");
                    done();
                });
        })

    });
});

//done
describe("Toggling Admin", function () {
    let changer = {
        toggleduser: "BobbyC"
    }
    let changing = {
        toggleduser: "testingregister"
    }
    let notexist = {
        toggleduser: "notexist"
    }
    it("toggle normal user to admin", function (done) {
        chai.request(app)
            .post(`/club/admin/BobbyC/toggleadmin`)
            .send(changing)
            .end(function (err, res) {
                
                expect(res.status).to.be.eq(200);
                res.text.should.include('Successful toggle!');
                done();
            });
    });
    it("toggle admin user to normal", function (done) {
        chai.request(app)
            .post(`/club/admin/BobbyC/toggleadmin`)
            .send(changing)
            .end(function (err, res) {
               
                expect(res.status).to.be.eq(200);
                res.text.should.include('Successful toggle!');
                done();
            });
    });
    it("toggle non existent user", function (done) {
        chai.request(app)
            .post(`/club/admin/BobbyC/toggleadmin`)
            .send(notexist)
            .end(function (err, res) {
              
                expect(res.status).to.be.eq(200);
                res.text.should.include('User does not exist!');
                done();
            });
    });
    it("toggle self", function (done) {
        chai.request(app)
            .post(`/club/admin/BobbyC/toggleadmin`)
            .send(changer)
            .end(function (err, res) {
              
                expect(res.status).to.be.eq(200);
                res.text.should.include('You cannot alter your own status');
                done();
            });
    });
});

//done
describe("Listen to Songs", function () {
    it("Proper Page shows up", function (done) {
        chai.request(app)
            .get(`/club/admin/BobbyC/songselect`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('Here you can view all songs');
                done();
            });
    })
    it("Slow Dancing in the Dark Loads", function (done) {
        chai.request(app)
            .get(`/joji`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('SLOW DANCING IN THE DARK');
                done();
            });
    })

    it("Hadestown Loads", function (done) {
        chai.request(app)
            .get(`/hadestown`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('Way down Hadestown II');
                done();
            });
    })

    it("Waving Through a Window Loads", function (done) {
        chai.request(app)
            .get(`/dear-evan-hansen`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('Waving Through a Window');
                done();
            });
    })

    it("Breathe Loads", function (done) {
        chai.request(app)
            .get(`/88rising`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('Breathe');
                done();
            });
    })

    it("Bad Guy Loads", function (done) {
        chai.request(app)
            .get(`/billie-eilish`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('bad guy');
                done();
            });
    })

    it("Dont Start Now Loads", function (done) {
        chai.request(app)
            .get(`/dua-lipa`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include("Don't Start Now");
                done();
            });
    })

    it("How Do You Sleep? Loads", function (done) {
        chai.request(app)
            .get(`/sam-smith`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include("How Do You Sleep?");
                done();
            });
    })

    it("It's You Loads", function (done) {
        chai.request(app)
            .get(`/ali-gatie`)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include("It's You");
                done();
            });
    })

});

//TO DO CONT (all below)
describe("Single Player", function () {
    jsdom({
        url: "http://localhost:5000/"
    })
    it("song data in single player is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector('#loginButton').click();
                    document.querySelector('#getToken').click();
                    document.querySelector('#getPlaying').click();
                    expect(res.status).to.be.eq(200);
                    expect(document.querySelector('h1').should.have.text('The Club'));
                    expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                })
                // document.addEventListener('DOMContentLoaded', function(event) {
                //     expect(document.querySelector('h1').should.have.text('The Club'));
                //     expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                // })
                done();
            })
    });
    it("embedded spotify play button in game is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    expect(document.querySelector('h1').should.have.text('The Club'));
                    expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                    expect(document.querySelector('songUri').should.have.text('0rKtyWc8bvkriBthvHKY8d'));
                })
                done();
            })
    });
 });

describe("Multiplayer", function () {});

describe("spotify web api authentication, song data from playback, Spotify play b", function () { 
    jsdom({
        url: "http://localhost:5000/"
    })
    it("app can reach spotify authentication page", function(done) {
        chai.request(app)
            .get(`/spotify-login`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                res.text.should.include('LoginController');
                done();
            })
    });
    it("login to spotify within web application", function(done) {
        const access_token = 'BQCK4GvSfLNTTZkAvV3_xhYOBGeROtptQtH_-GQFcxKLp-PXBtYZucN-dPN6TENAhkGIRWvsbfOk7Dit-3q6tutSiwmKf-Ypk75-EHXF9gWdaaT0iQ5NtaTTcbUp2ptoFW9vLOsTBp7meo98idMaZeXlYuvbShMnfghjdCJHCVb0zLebq_UiPw8';
        // const refresh_token = 'AQCmKha13lOmHsONVh3uk9mIUBZ87UbMIYvomy51DqTudaiNJZxAfD9H-9P8Q6d9QjbWDOsDiGdtXd718mQKF0ean5t7iqYIYMtSV4djKicnxoe1bjBroYYCMhC9ETc_79g';
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector("#loginButton").click();
                    var hashParams = {};
                    var e, r = /([^&;=]+)=?([^&;]*)/g,
                        q = window.location.hash.substring(1);
                    while ( e = r.exec(q)) {
                    hashParams[e[1]] = decodeURIComponent(e[2]);
                    }
                    expect(hashParams.access_token).to.equal(access_token)
                })
                done();
            })
    });
    it("upon login, user can retreive spotify access token", function (done) {
        const access_token = 'BQCK4GvSfLNTTZkAvV3_xhYOBGeROtptQtH_-GQFcxKLp-PXBtYZucN-dPN6TENAhkGIRWvsbfOk7Dit-3q6tutSiwmKf-Ypk75-EHXF9gWdaaT0iQ5NtaTTcbUp2ptoFW9vLOsTBp7meo98idMaZeXlYuvbShMnfghjdCJHCVb0zLebq_UiPw8';
        // const refresh_token = 'AQCmKha13lOmHsONVh3uk9mIUBZ87UbMIYvomy51DqTudaiNJZxAfD9H-9P8Q6d9QjbWDOsDiGdtXd718mQKF0ean5t7iqYIYMtSV4djKicnxoe1bjBroYYCMhC9ETc_79g';
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector("#loginButton").click();
                    // res.text.should.include(access_token);
                    document.querySelector("#getToken").click();
                    expect(document.querySelector("#tokenid").value.to.equal(access_token));
                })    
                done();
            })
    });
    it("user attempts to retrive access token without spotify authentication", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector('#getToken').click();
                    expect(document.querySelector('#token').should.have.text('Please login to Spotify first'));
                })
                done();
            })
    });
    it("user attempts to get now playing without access token", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector('#getPlaying').click();
                    expect(res.status).to.be.eq(401);
                })    
                done();
            })
    });
    it("successful spotify authentication & access token retreival without current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector('#loginButton').click();
                    document.querySelector('#getToken').click();
                    document.querySelector('#getPlaying').click();
                    expect(document.querySelector('#token').should.have.text(''));
                })
                done();
            })
    });
    it("successful spotify authentication & access token retreival with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector('#loginButton').click();
                    document.querySelector('#getToken').click();
                    document.querySelector('#getPlaying').click();
                    expect(res.status).to.be.eq(200);
                    expect(document.querySelector('h1').should.have.text('The Club'));
                })
                done();
            })
    });
    it("song data is consistent with current spotify playback ", function (done) {
        chai.request(app)
            // .get(`/playing`)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                // document.addEventListener('DOMContentLoaded', function(event) {
                //     expect(document.querySelector('h1').should.have.text('The Club'));
                //     expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                // })
                document.addEventListener('DOMContentLoaded', function(event) {
                    document.querySelector('#loginButton').click();
                    document.querySelector('#getToken').click();
                    document.querySelector('#getPlaying').click();
                    expect(res.status).to.be.eq(200);
                    expect(document.querySelector('h1').should.have.text('The Club'));
                    expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                })
                done();
            })
    });
    it("embedded spotify play button is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.addEventListener('DOMContentLoaded', function(event) {
                    expect(document.querySelector('h1').should.have.text('The Club'));
                    expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                    expect(document.querySelector('songUri').should.have.text('0rKtyWc8bvkriBthvHKY8d'));
                })
                done();
            })
    });

});

describe("ROOMS/SOCKET", function () { });

//cleanup; done
describe("CLEAN UP POST TEST", function () {
    it('delete "new user" post-test', (done) => {
        let person = {
            username: "testingregister",
            password: "x"
        }
        chai.request(app)
            .post(`/BobbyC/deleted`)
            .send(person)
            .end(function (err, res) {
                expect(res.status).to.be.eq(200);
                done();
            });
    });
});

describe("Game Functions", function () {
    describe("game_end()", function () {
        it("game_running true", function () {
            game_running = true;
            game_end()
            assert.equal(false, game_running);
        })
        it("game_running false", function(){
            game_running = false;
            game_end()
            assert.equal(false, game_running)
        })
    })
    describe("reset_conditions()", function(){
        it("key_flag true", function (){
            key_flag = true;
            reset_conditions()
            assert.equal(false, key_flag)
        })
        it("key_flag false", function(){
            key_flag = false;
            reset_conditions()
            assert.equal(false, key_flag)
        })
    })

    describe("add_glass()", function(){
        describe("player_num == 0", function(){
            player_num = 0;
            filled_glasses = 0;
            glasses = [0,0,0,0,0,0,0,0,0,0];
            
            it("adds glass somewhere in glasses", function(){
                add_glass()
                var glass_added = false
                for(i=0; i<10; i++){
                    if (glasses[i] != 0) {glass_added = true}
                }
                assert.equal(true, glass_added)
                assert.equal(1, filled_glasses)
            })

            it("fills available spaces", function(){
                for(i=0; i<10; i++){add_glass()}                
                var all_added = true
                for(i=0; i<10; i++){
                    if (glasses[i] == 0) {all_added = false}
                }
                //console.log(glasses)
                assert.equal(true, all_added)
                assert.equal(10, filled_glasses)
            })

            it("does not change once full", function(){
                for(i=0; i<10; i++){add_glass()}                
                var all_added = true
                for(i=0; i<10; i++){
                    if (glasses[i] == 0) {all_added = false}
                }
                //console.log(glasses)
                assert.equal(true, all_added)
                assert.equal(10, filled_glasses)
            })
        })
        for(num=1; num<4; num++)
            describe("player_num == " + num, function(){
                player_num = num;
                filled_glasses = 0;
                glasses = [0,0,0,0,0,0,0,0,0,0];
                add_glass()
                
                it("adds glass somewhere in glasses", function(){
                    var glass_added = false
                    for(i=0; i<10; i++){
                        if (glasses[i] != 0) {glass_added = true}
                    }
                    assert.equal(false, glass_added)
                    assert.equal(0, filled_glasses)
                })

                it("fills available spaces", function(){
                    for(i=0; i<10; i++){add_glass()}                
                    var all_added = true
                    for(i=0; i<10; i++){
                        if (glasses[i] == 0) {all_added = false}
                    }
                    assert.equal(false, all_added)
                    assert.equal(0, filled_glasses)
                })

                it("does not change once full", function(){
                    for(i=0; i<10; i++){add_glass()}                
                    var all_added = true
                    for(i=0; i<10; i++){
                        if (glasses[i] == 0) {all_added = false}
                    }
                    assert.equal(false, all_added)
                    assert.equal(0, filled_glasses)
                })
            })
    })
});
