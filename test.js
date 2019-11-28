process.env.DATABASE_URL = "postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
var request = require("request"),
    assert = require('assert'),
    app = require("./index.js"),
    base_url = "http://localhost:5000/";

chai = require("chai");
chaiHttp = require('chai-http');
chai.use(require('chai-dom'));
let should = chai.should();
chai.use(chaiHttp);

chai.use(chaiHttp);
const { expect } = chai;

var jsdom = require('mocha-jsdom')

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
                    res.text.should.include("Vanthournout");//holds 10th place player or lowest player if less than ten 
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

//TO DO CONT (all below)
describe("Single Player", function () {
    jsdom({
        url: "http://localhost:5000/"
    })
    it("song data in single player is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/playing`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                expect(document.querySelector('h1').should.have.text('The Club'));
                expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                done();
            })
    });
    it("embedded spotify play button in game is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                expect(document.querySelector('h1').should.have.text('The Club'));
                expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                expect(document.querySelector('songUri').should.have.text('0rKtyWc8bvkriBthvHKY8d'));
                done();
            })
    });
 });

describe("Multiplayer", function () { });

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
                document.querySelector('#loginButton').click();
                var hashParams = {};
                var e, r = /([^&;=]+)=?([^&;]*)/g,
                    q = window.location.hash.substring(1);
                while ( e = r.exec(q)) {
                hashParams[e[1]] = decodeURIComponent(e[2]);
                }
                expect(hashParams.access_token).to.equal(access_token)
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
                document.querySelector('#loginButton').click();
                // res.text.should.include(access_token);
                document.querySelector('#getToken').click();
                expect(document.querySelector('#tokenid').value.to.equal(access_token));
                done();
            })
    });
    it("user attempts to retrive access token without spotify authentication", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.querySelector('#getToken').click();
                expect(document.querySelector('#token').should.have.text('Please login to Spotify first'));
                done();
            })
    });
    it("user attempts to get now playing without access token", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.querySelector('#getPlaying').click();
                expect(res.status).to.be.eq(401);
                done();
            })
    });
    it("successful spotify authentication & access token retreival without current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.querySelector('#loginButton').click();
                document.querySelector('#getToken').click();
                document.querySelector('#getPlaying').click();
                expect(document.querySelector('#token').should.have.text(''));
                done();
            })
    });
    it("successful spotify authentication & access token retreival with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                document.querySelector('#loginButton').click();
                document.querySelector('#getToken').click();
                document.querySelector('#getPlaying').click();
                expect(res.status).to.be.eq(200);
                expect(document.querySelector('h1').should.have.text('The Club'));
                done();
            })
    });
    it("song data is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/playing`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                expect(document.querySelector('h1').should.have.text('The Club'));
                expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                done();
            })
    });
    it("embedded spotify play button is consistent with current spotify playback ", function (done) {
        chai.request(app)
            .get(`/music`)
            .end(function(err, res) {
                expect(res.status).to.be.eq(200);
                expect(document.querySelector('h1').should.have.text('The Club'));
                expect(document.querySelector('p').should.have.text('Now Playing: SLOW DANCING IN THE DARK by Joji'));
                expect(document.querySelector('songUri').should.have.text('0rKtyWc8bvkriBthvHKY8d'));
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

    