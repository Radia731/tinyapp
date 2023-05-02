
const express = require("express");
const app = express();
const PORT = 7777; // default port 8080

app.set("view engine", "ejs") //tells the Express app to use EJS as its templating engine


app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {  // setting the routes 
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port:`, PORT);
});

