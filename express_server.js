///////////////////////////////////////////////////
////////////////Requires
///////////////////////////////////////////////////

const express = require("express");
const { getUserByEmail } = require("./helpersTest");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const app = express();
const PORT = 4999;

///////////////////////////////////////////////////
////////////////MiddleWare
///////////////////////////////////////////////////


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(cookieParser());
app.use(morgan('dev'));

///////////////////////////////////////////////////
////////////////Configuration
///////////////////////////////////////////////////


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

///////////////////////////////////////////////////
////////////////The Database
///////////////////////////////////////////////////



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.TD.ca",
    userID: "john000",
  },
  i3BoGr: {
    longURL: "https://www.instagram.ca",
    userID: "bella001",
  },
};

///////////////////////////////////////////////////
//////////////// Users
///////////////////////////////////////////////////


const users = {
  john000: {
    id: "john000",
    email: "johnA000@gmail.com",
    password: bcrypt.hashSync('bubbleGum', 10)
  },
  bella001: {
    id: "bella001",
    email: "bella001B@gmail.com",
    password: bcrypt.hashSync('Apple', 10)
  },
};


///////////////////////////////////////////////////
//////////////// Error Message 
///////////////////////////////////////////////////


const emailBlank = 'Please enter your email.';
const emailConflict = 'Email already exists!';
const emailNotFound = 'Email does not exist.';
const passBlank = 'Enter a password.';
const passError = 'Incorrect password.';
const url404 = 'URL not found: Invalid ID.';
const wrongUser = 'Permission denied to edit this URL: wrong user.';
const wrongPerm = 'Permission denied to edit this URL: please login.';

function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function requireLogin(req, res, next) {
  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    next();
  }
}

let cookieID;

const checkAuth = (email, pass) => {
  for (const user in users) {
    if (email === users[user].email && bcrypt.compareSync(pass, users[user].password)) {
      cookieID = users[user].id;
      return true;
    }
  }
  return false;
};

///////////////////////////////////////////////////
//////////////// app.js/ routes 
///////////////////////////////////////////////////

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.redirect("/urls/");
});

app.get("/data.json", (req, res) => {
  const data = {
    urlDatabase,
    users
  };
  res.set("Content-Type", "application/json");
  res.send(JSON.stringify(data, null, 2));
});

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

app.get("/urls", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (!user) {
    res.redirect('/login');
  } else {
    const userURLs = urlsForUser(userId);
    const templateVars = {
      urls: userURLs,
      user: user
    };
    res.render('urls_index', templateVars);
  }
});

///////////////////////////////////////////////////
//////////////// New Route
///////////////////////////////////////////////////

app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: user
    };
    res.render('urls_new', templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send('URL does not exist');
  }
  if (url.userID !== userId) {
    return res.status(403).send('You do not have access to this URL');
  }
  const templateVars = {
    id: shortURL,
    longURL: url.longURL,
    user
  };
  res.render('urls_show', templateVars);
});

app.post("/urls", requireLogin, (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userId = req.session.userID;
  urlDatabase[shortURL] = { longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.userID;
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send('URL does not exist');
  }
  if (url.userID !== userId) {
    return res.status(403).send('You do not have access to this URL');
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.userID;
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send('URL does not exist');
  }
  if (url.userID !== userId) {
    return res.status(403).send('You do not have access to this URL');
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

///////////////////////////////////////////////////
//////////////// Register Routes
///////////////////////////////////////////////////

app.get("/register", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user
    };
    res.render('register', templateVars);
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send(emailBlank);
  }
  if (!password) {
    return res.status(400).send(passBlank);
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send(emailConflict);
  }
  const userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  req.session.userID = userId;
  res.redirect('/urls');
});
///////////////////////////////////////////////////
//////////////// Login Route
///////////////////////////////////////////////////

app.get("/login", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user
    };
    res.render('login', templateVars);
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send(emailBlank);
  }
  if (!password) {
    return res.status(400).send(passBlank);
  }
  if (!checkAuth(email, password)) {
    return res.status(403).send(passError);
  }
  req.session.userID = cookieID;
  res.redirect("/urls");
});

///////////////////////////////////////////////////
//////////////// Logout Route
///////////////////////////////////////////////////

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send(url404);
  }
  res.redirect(url.longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});
