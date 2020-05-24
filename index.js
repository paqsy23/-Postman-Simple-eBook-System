const express = require("express"), cors = require("cors");
const bookshelf = require("./routes/bookshelf");
const app = express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use("/bookshelf", bookshelf);

app.listen(3000, () => {
    console.log("Listening on port 3000...");
});