process.env.DATABASE_URL = "postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
var request = require("request"),
    assert = require('assert'),
    app = require("./index.js"),
    base_url = "http://localhost:5000/";

chai = require("chai");
chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
const { expect } = chai;

describe("Home Page Running?", function () {
        it("returns status code 200", function (done) {
            request.get(base_url, function (error, response, body) {
                //expect(response.statusCode).toBe(200);
                assert.equal(200, response.statusCode);
                done();
            });
        });
});

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
                /*expect(res.body.data).to.include({
                    username: person.username,
                    password: person.password,
                });*/
             
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
               /* expect(res.body.data).to.include({
                    username: person.username,
                    password: person.password,
                });*/
                expect(res.status).to.be.eq(200);
                res.text.should.include('Username taken.');
                done();
            });
    });
});

//TODOS
describe("LogIn and LogOut", function () {
});

describe("Stats and Leaderboard", function () {
});

//done this one
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
                /* expect(res.body.data).to.include({
                     username: person.username,
                     password: person.password,
                 });*/
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
                /* expect(res.body.data).to.include({
                     username: person.username,
                     password: person.password,
                 });*/
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
                /* expect(res.body.data).to.include({
                     username: person.username,
                     password: person.password,
                 });*/
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
                /* expect(res.body.data).to.include({
                     username: person.username,
                     password: person.password,
                 });*/
                expect(res.status).to.be.eq(200);
                res.text.should.include('You cannot alter your own status');
                done();
            });
    });
});

//TO DO CONT
describe("Single Player", function () { });

describe("Multiplayer", function () { });

describe("API", function () { });

describe("ROOMS/SOCKET", function () { });

//done this too
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

    