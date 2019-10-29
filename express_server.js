const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const request = require('request');

app.set("view engine", "ejs");
app.use(cookieParser())






const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}



// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });


 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

 app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//return random 6 digit alphanumeric shorturl for any http webpage
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();

  if(req.body.longURL.startsWith('http://')) {
    urlDatabase[newShortURL] = req.body.longURL;
  } else {
    urlDatabase[newShortURL] = `http://${req.body.longURL}`;
  }

request(urlDatabase[newShortURL], (error) => {
  if(error) {
    res.send('no such url.');
    return; }
  res.redirect(`/urls/${newShortURL}`);
});
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id]
  let templateVars = { 
    shortURL: req.params.id, 
    longURL: longURL,
    urlDatabase: urlDatabase
  };
  res.render("urls_show", templateVars);
});

//redirect short url to long url
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
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

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;

  if(longURL.startsWith('http://')) {
    urlDatabase[shortURL] = longURL;
  } else {
    urlDatabase[shortURL] = `http://${longURL}`;
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