const express = require("express");
const app = express();
// const cookieParser = require('cookie-parser')
// app.use(cookieParser())
const PORT = 8080; // default port 8080
const request = require('request');
const bcrypt = require('bcrypt');

const cookieSession = require('cookie-session')
//req.session.id = "some value";



app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


// Returns the subset of the URL database taht belongs to the user with ID
function urlsOfUser(id, urlDatabase) {
  let urlOfUserNew = {};
  if(id) {
    for (const key in urlDatabase) {
        if (urlDatabase[key].userID === id) {
          urlOfUserNew = Object.assign(urlOfUserNew, {[key]: urlDatabase[key]}); 
        }
      }
    }

  return urlOfUserNew;
}
//let passwordNew = bcrypt.hashSync('password', 10);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    hashedPassword: bcrypt.hashSync('password', 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    hashedPassword: bcrypt.hashSync('password', 10)
  }
}



function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const isEmail = (object, email) => {
  for (const key in object) {
      if (Object.values(object[key]).indexOf(email) > -1) {
          return true;
      }
  }
};



app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.id]
  };
  res.render("urls_new", templateVars);
  //res.render("urls_new");
});


app.get("/urls", (req, res) => {
    let templateVars = {
      urls: urlsOfUser(req.session.id, urlDatabase),
      user: users[req.session.id] 

  };
  res.render("urls_index", templateVars);
});


//return random 6 digit alphanumeric shorturl for any http webpage
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const longURL = req.body.longURL;
  
  //console.log(req.body.longURL);
  if((longURL.startsWith('http://')) || (longURL.startsWith('www://'))) {
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: ["id"]
    };
  } else {
    urlDatabase[newShortURL] = {
      longURL: `http://${req.body.longURL}`,
      userID: req.session.id
    };
  }
  
  // request(longURL, (error) => {
  //   if(error) {
  //     res.send('no such url.');
  //     return; }
  //     res.redirect(`/urls/${newShortURL}`);
  //   });
  res.redirect(`/urls/${newShortURL}`);
});
  
//LOGIN
app.post('/login', (req, res) => { // Checking if the inofrmation been entered corrctly or no.
  const { email, password } = req.body;
  let isPassworg = false;
  for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        console.log('userrrrr', user);
        console.log('email pass', { email, password })
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
      res.status(403).send("<h3>Email Not Found!!!</h3>");
  } else if (!isPassworg && isEmail(users, email)) {
      res.status(403).send("<h1>Password does not match!</h1>");
  }
 });
 app.get('/login', (req, res) => {
  let templateVars = {
      user: req.session.id
  };
  return res.render('login', templateVars);
});

//LOGOUT
app.post('/urls/logout', (req, res) => {
  // Cookies that have not been signed
  req.session.id = "id"; 
  req.session.email = "email";
  req.session.password = "password";
  res.redirect('/urls')
})


  
//register 
app.post('/register', (req, res) => {
  const id = generateRandomString();
  
  let email = req.body.email;
  let password = req.body.password;
  
  
  if (!email || !password) {
    res.status(400);
    res.send("please provide email and password");
    return;
  } 
  
  for (let check in users) {
    if (email === users[check].email) {
      res.status(400)
      res.send(" email exists, plase use another email.");
      return;
    } 
  }
  const hashedPassword = bcrypt.hashSync(password, 10)
  req.session.id = id;
  // req.session.password = "hashedPassword";
  // req.session.email = "req.body.email";
  
  users[id] = { id, email, password: hashedPassword };
  console.log(users);
  res.redirect('/urls')
})


//registers a new user
app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.id] } 
  return res.render('urls_reg', templateVars);
});


app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  let templateVars = { 
    shortURL: req.params.id,
    user: users[req.session.id],
    longURL: longURL
    };
  res.render("urls_show", templateVars);
});

//redirect short url to long url
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  console.log('hitting id post')
  res.redirect("/urls/" + shortURL);
});

//redirect long url to actual webpage.
app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});




//Edit
app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
const longURL = req.body.longURL;
 if (longURL.startsWith('http://www')|| longURL.startsWith('http://')) {
   urlDatabase[shortURL] = { longURL: longURL, userID: req.session.id};
 } else {
   urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: req.session.id};
 }
 request(urlDatabase[shortURL].longURL, (error) => {                   //response here to get back the body size and to use it on the bytes
   if (error) {
     res.send("check your URL");
     return;
   }
   res.redirect('/urls/' + shortURL);
 });
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});