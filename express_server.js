////////////////requires///////////////////
const express = require("express");
const { getUserByEmail } = require("./helpersTest");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const app = express();
const PORT = 4999; // port


////////middleware//////////////////////////
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(cookieParser());
app.use(morgan ('dev'));



////////////configuration/////////////////////////

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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


///////////////////users///////////////
const users = {
  john000: {
    id: "john000",
    email: "johnA000@gmail.com",
    password: bcrypt.hashSync('bubbleGum', 10)
  },
  bella001: {
    id: "bella001",
    email: "bella001B@gmail.com",
    password:  bcrypt.hashSync('Apple', 10)
  },
};

///////////error messages ///////////////

const emailBlank = 'Please enter your email.';
const emailConflict = 'Email already exist!';
const emailNotFound = 'Email does not exist.';
const passBlank = 'enter a password.';
const passError = 'incorrect Password';
const url404 = 'URL Not Found Invalid ID.';
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

// Check both user and password, if match on post return to true.
const checkAuth = (email, pass) => {
  for (const user in users) {
    if (email === users[user].email && bcrypt.compareSync(pass, users[user].password)) {
      cookieID = users[user].id;
      return true;
    }
  }
  return false;
};



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// GET Redirect localhost to /urls page.
app.get("/", (req, res) => {
  res.redirect("/urls/");
});

// GET Display JSON Data
app.get("/data.json", (req, res) => {
  const data = {
    urlDatabase,
    users
  };
  res.set("Content-Type", "application/json");
  res.send(JSON.stringify(data, null, 2));
});
////////////////////Only list url for the logged in user///////////////////////////

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

//////////////////ROUTES/////////////////////
app.get("/urls", (req, res) => {
  const userId = req.session.userID;
  console.log("userId", userId)
  const user = users[userId];
  console.log("user", user)
  if (!user) {
    res.redirect('/login');
  } else {
    const userURLs = urlsForUser(userId);
    const templateVars = {
      urls: userURLs,
      // username: req.sesson.username,
      user: user
    };
    res.render('urls_index', templateVars);
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
    return res.status(403).send('You do not have access this URL');
  }
  const templateVars = { 
    shortURL,
    longURL: url.longURL,
    user
  };
  res.render('urls_show', templateVars);
});

app.post("/urls", requireLogin, (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userId = req.session.userID;
  urlDatabase[shortURL] = { longURL, userId };
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


/////////////////////////////  REGISTER//////////////////////////////
app.get("/register", (req, res) => {
  const userId = req.session.userID;
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

/////////////////////////////////////LOGIN//////////////////////////////////////////////

app.get("/login", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId]
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user
    };
    res.render("login", templateVars);
  }
});

//////////////////////////////NEW route ///////////////////////////////////
app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
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


/////////////////////ID ROUTE//////////////////
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  const urlId = req.params.id;
  if (!user) {
    res.redirect("/login");
  } else if (!urlDatabase[urlId]) {
    res.status(404).send("URL not found");
  } else if (urlDatabase[urlId].userID !== userId) {
    res.status(403).send("You do not have access to this URL");
  } else {
    const templateVars = { 
      user: users[userId],
      username: session.username,
      id: urlDatabase, 
      longURL: urlDatabase[urlId].longURL 
    };
    res.render("urls_show", templateVars);
  }
});

// GET Redirect to longURL website
app.get("/u/:id", (req, res) => {
  // We have to check if the URL exists in the database.
  if (checkURL(req.params.id)) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send(url404);
  }
});

// POST Create new key for new URL
app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    // Protect from malicious uses.
    res.send("Login Required!\n");
  } else {
    const id = generateRandomString(6); // Call function to generate random 6 characters
    const url = req.body.longURL;
    urlDatabase[id] = {
      longURL: checkHttp(url),
      userID: req.session.userId
    };
    res.redirect(`/urls/${id}`);
  }
});


// POST Update existing URL
app.post("/urls/:id", (req, res) => {
  // We need to check if the URL exists, check if the user logged in, check if it is correct logged in user before actioning Delete.
  if (checkURL(req.params.id)) {
    if (!req.session.userId) {
      res.status(403).send(wrongPerm);
    } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
      res.status(403).send(wrongUser);
    } else {
      const id = req.params.id;
      const url = req.body.longURL;
      urlDatabase[id] = {
        longURL: checkHttp(url),
        userID: req.session.userId
      };
      res.redirect("/urls/");
    }
  } else {
    res.status(403).send(url404);
  }
});

// POST Delete URL entry
app.post("/urls/:id/delete", (req, res) => {
  // We need to check if the URL exists, check if the user logged in, check if it is correct logged in user before actioning Delete.
  if (checkURL(req.params.id)) {
    if (!req.session.userId) {
      res.status(403).send(wrongPerm);
    } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
      res.status(403).send(wrongUser);
    } else {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    }
  } else {
    res.status(403).send(url404);
  }
});


app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!email) {
    res.status(400).send(emailBlank);
  } else if (!password) {
    res.status(400).send(passBlank);
  } else if (user) {
    res.status(400).send(emailConflict);
  } else {
    users[id] = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.userId = users[id].id;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  const auth = checkAuth(email, password);
console.log ("user", user)
console.log ("auth", auth)
  if (!email) {
    res.status(403).send(emailBlank);
  } else if (!password) {
    res.status(403).send(passBlank);
  } else if (user) {
    if (auth) {
      req.session.userID = cookieID;
      console.log("cookieID", cookieID)
      res.redirect("/urls");
    } else {
      res.status(403).send(passError);
    }
  } else {
    res.status(403).send(emailNotFound);
  }
});
//////////////////////////LOGOUT////////////////////////////////////

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});