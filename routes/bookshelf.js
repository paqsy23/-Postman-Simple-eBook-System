const express = require("express"), mysql = require("mysql");
const config = require("../config");
const router = express.Router();
const conn = mysql.createConnection(config.database);

//Insert book to bookshelf
router.post("/insert", (req, res) => {

});

//Show user's bookshelf
router.get("/", (req, res) => {

});

//Search user's bookshelf
router.get("/search/:username", (req, res) => {

});

//Change bookshelf privacy (Premium User)
router.put("/changePrivacy", (req, res) => {

});

//Delete book from bookshelf
router.delete("/delete", (req, res) => {

});