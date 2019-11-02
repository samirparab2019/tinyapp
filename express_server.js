const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const request = require('request');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

const { urlsOfUser } = require('./helpers.js');
const { generateRandomString } = require('./helpers.js');
const { isEmail } = require('./helpers.js');

// ---------------------------------> Configure
app.set('view engine', 'ejs');

// ---------------------------------> Cookie Session
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// ---------------------------------> URL Database
const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

// ---------------------------------> Body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));


// ---------------------------------> Users Database examples
const users = { 
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    hashedPassword: bcrypt.hashSync('password', 10)
  },
  'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    hashedPassword: bcrypt.hashSync('password', 10)
  }
}

//-------------------------------> Main page
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsOfUser(req.session.id, urlDatabase),
    user: users[req.session.id] 
  };
  res.render('urls_index', templateVars);
});

// -------------------------------> New URL Page
app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.session.id]
  };
  res.render('urls_new', templateVars);
});

// --------------------------------> Reads the short URL
app.get('/urls/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  let templateVars = { 
    shortURL: req.params.id,
    user: users[req.session.id],
    longURL: longURL
    };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//-------------------------------> Random URL to database
app.post('/urls', (req, res) => {
  const newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  
    if((longURL.startsWith('http://')) || (longURL.startsWith('www://'))) {
      urlDatabase[newShortURL] = {
        longURL: req.body.longURL,
        userID: ['id']
      };
    } else {
      urlDatabase[newShortURL] = {
        longURL: `http://${req.body.longURL}`,
        userID: req.session.id
      };
    }
    res.redirect(`/urls/${newShortURL}`);
  });

//-------------------------------> Short URL Page
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

//-----------------------------> Deletes the URL
app.post('/urls/:id/delete', (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//--------------------------------> Login
 app.get('/login', (req, res) => {
  let templateVars = {
      user: users[req.session.id]
  };
  return res.render('login', templateVars);
});

//------------------------> Registers a new user
app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.id] } 
  return res.render('urls_reg', templateVars);
});

//LOGIN
app.post('/login', (req, res) => { // Checking if the inofrmation been entered corrctly or no.
  const { email, password } = req.body;
  let isPassworg = false;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      if (
        user.password && password &&
        bcrypt.compareSync(password, user.password)
      ) {
          isPassworg = true;
          req.session.id =  user.id;
          res.redirect('/urls');
        }
    }
  }
  if (!isEmail(users, email)) {
      res.status(403).send('<h1>Email Not Found!!!</h1>');
  } else if (!isPassworg && isEmail(users, email)) {
      res.status(403).send('<h1>Password does not match!</h1>');
  }
});

//register 
app.post('/register', (req, res) => {
  const id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
 
  if (!email || !password) {
    res.status(400);
    res.send('please provide email and password');
    return;
  } 
  
  for (let check in users) {
    if (email === users[check].email) {
      res.status(400)
      res.send('email exists, plase use another email.');
      return;
    } 
  }
  const hashedPassword = bcrypt.hashSync(password, 10)
  req.session.id = id;
  users[id] = { id, email, password: hashedPassword };
  res.redirect('/urls')
})

// -----------------------------> Logout
app.post('/urls/logout', (req, res) => {
  // Cookies that have not been signed
  req.session.id = 'id'; 
  req.session.email = 'email';
  req.session.password = 'password';
  res.redirect('/urls')
})

// ------------------------------> Updates the short URL
app.post('/urls/:id/update', (req, res) => {
  let shortURL = req.params.id;
  const longURL = req.body.longURL;
  if (longURL.startsWith('http://www')|| longURL.startsWith('http://')) {
   urlDatabase[shortURL] = { longURL: longURL, userID: req.session.id};
  } else {
   urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: req.session.id};
  }
  request(urlDatabase[shortURL].longURL, (error) => {                   
   if (error) {
     res.send('check your URL');
     return;
    }
    res.redirect('/urls/' + shortURL);
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});