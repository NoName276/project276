process.env.DATABASE_URL = "postgres://onmhemgydrtawp:44340bfdc255d71d386e984a35a34725a508b67d94cc356653fc8aa407264744@ec2-174-129-252-252.compute-1.amazonaws.com:5432/dad64i7292eb5o"
var request = require("request"),
    assert = require('assert'),
    app = require("./index.js"),
    base_url = "http://localhost:5000/";

chai = require("chai");
chaiHttp = require('chai-http');
let should = chai.should();
//import chatHttp from 'chai-http';
//import 'chai/register-should';
//import app from './index.js';

chai.use(chaiHttp);
const { expect } = chai;

describe("If Home Page Running", function () {
    describe("GET /", function () {
        it("returns status code 200", function (done) {
            request.get(base_url, function (error, response, body) {
                //expect(response.statusCode).toBe(200);
                assert.equal(200, response.statusCode);
                done();
            });
        });
    });
});

describe("404 page testing", function () {
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
    beforeEach((done) => { //Before each test we empty the database of testingregister
        chai.request(app)
            .post(`/BobbyC/deleted`)
            .send("testingregister")
        done();
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
              
            });
    });
});