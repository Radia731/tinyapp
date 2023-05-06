const express = require("express");
const app = express();
const PORT = 7777; // default port 8080

app.set("view engine", "ejs") //tells the Express app to use EJS as its templating engine
app.use(express.urlencoded({ extended: true })); // adding a middle ware 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
    });

app.get("/urls", (req, res) => { // setting routes
    res.send(urlDatabase);
  });

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });  
  
app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL:urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
  });

app.get("/", (req, res) => {  
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
    console.log(req.body); // Log the POST request body to the console
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
  });

  app.get("/u/:id", (req, res) => {
    const shortURL = req.params.id;
    const longURL = urlDatabase[shortURL];
    if (longURL) {
      res.redirect(longURL);
    } else {
      res.status(404).send("Short URL not found");
    }
  });
  

app.listen(PORT, () => {
  console.log(`Example app listening on port:`, PORT);
});

