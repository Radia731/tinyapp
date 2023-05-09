const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8999; // default port 7777

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username,
    user: user
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = { 
    user: users[userId],
    username: req.cookies.username,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username: req.cookies.username,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user
    };
    res.render('urls_new', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send('URL does not exist');
  }
  if (url.userId !== userId) {
    return res.status(403).send('You do not have access to this URL');
  }
  const templateVars = { 
    shortURL,
    longURL: url.longURL,
    user
  };
  res.render('urls_show', templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId]
  if (user) { // logged in user 
    res.redirect('/urls');
  } else { 
    const templateVars = {
      user
    };
    res.render('Register', templateVars);
  }
});



app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email and password fields are required.");
    return;
  }

  // check if email already exists
  const existingUser = findUserByEmail(email, users);
  if (existingUser) {
    res.status(400).send("Account already exists.");
    return;
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  users[id] = newUser;

  res.cookie("user_id", id);
  res.redirect("/urls");
});

function findUserByEmail(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


app.get('/login', (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId]
  if (user) { // logged in user 
    res.redirect('/urls');
  } else { 
    const templateVars = {
      user
    };
    res.render('login', templateVars);
  }
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid email or password");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});