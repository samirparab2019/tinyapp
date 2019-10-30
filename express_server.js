const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080; // default port 8080
const request = require('request');

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}



function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}




// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


 app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
  //res.render("urls_new");
});

app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});

//return random 6 digit alphanumeric shorturl for any http webpage
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  console.log(newShortURL);

  //console.log(req.body.longURL);
  if((req.body.longURL.startsWith('https://')) || (req.body.longURL.startsWith('http://'))) {
    urlDatabase[newShortURL] = req.body.longURL;
  } else {
    urlDatabase[newShortURL] = `https://${req.body.longURL}`;
  }

request(urlDatabase[newShortURL], (error) => {
  if(error) {
    res.send('no such url.');
    return; }
  res.redirect(`/urls/${newShortURL}`);
});
});

//LOGIN
app.post('/urls/login', (req, res) => {
  const { email, password } = req.body;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      if (user.password === password) {
        res.cookie('userId', userId);
        res.redirect('/urls')
      }
    }
  }
  // Cookies that have not been signed
  //res.cookie('username', req.body.username); 
  
})

//LOGOUT
app.post('/urls/logout', (req, res) => {
  // Cookies that have not been signed
  res.clearCookie('username', req.body.username); 
  res.redirect('/urls')
})


  
  
app.post('/register', (req, res) => {
  
  const id = generateRandomString();
  const user_id = generateRandomString()
  let email = req.body.email;
  let password = req.body.password;
  
  
  if (!email || !password) {
    res.status(400);
    res.send("please provide email and password");
    return;
  } 
  
  for (let check in users) {
    if (email = users[check].email) {
      res.status(400)
      res.send(" email exists, plase use another email.");
      return;
    } else {

    }
  }

  
  users[user_id] = { id, email, password };
  res.cookie('password', req.body.password);
  res.cookie('email', req.body.email);
  //console.log(newUser);
  res.redirect('/urls')
})
//registers a new user
app.get('/register', (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  return res.render('urls_reg', templateVars);
});


app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id]
  let templateVars = { 
    shortURL: req.params.id,
    username: req.cookies["username"],
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
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});
// app.post("/urls/:id/edit", (req, res) => {
  
//   res.redirect("/urls/");
// });

//Edit
app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;

  if(longURL.startsWith('https://')) {
    urlDatabase[shortURL] = longURL;
  } else {
    urlDatabase[shortURL] = `https://${longURL}`;
  }

request(urlDatabase[shortURL], (error) => {
  if(error) {
    res.send('no such url.');
    return; }
  res.redirect(`/urls/${shortURL}`);
});

})


  




// app.get("/urls/:longURL", (req, res) => {
//   urlDatabase[newShortURL] = req.body.longURL;
//   res.redirect(`/urls/${newShortURL}`);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});