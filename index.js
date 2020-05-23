const express = require('express');
const app = express();

const bookshelf = require("./routes/bookshelf");
const review = require("./routes/review");

app.use(express.urlencoded({extended:true}));
app.use("/bookshelf", bookshelf);
app.use("/review", review);

app.listen(3000, () => {
    console.log("Listening on port 3000...");
});