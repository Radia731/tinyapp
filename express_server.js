const express = require("express");
const app = express();
const PORT = 7777; // default port 8080

app.set("view engine", "ejs") //tells the Express app to use EJS as its templating engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
    });

app.get("/urls", (req, res) => { // setting routes
    res.send(urlDatabase);
  });
  
app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
  });

app.get("/", (req, res) => {  
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port:`, PORT);
});