// --------------------------------->Returns the subset of the URL database taht belongs to the user with ID
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

// --------------------------------->generates random 6 digit alphanumeric string;
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

// --------------------------------->get user details by comparing email
function getUserByEmail(email, database) {
  for (let uid in database) {
    if  (email === database[uid].email) {
      return database[uid];
    } else {
      return undefined;
    }

  }
}

module.exports = { 
  urlsOfUser, 
  generateRandomString, 
  isEmail,
  getUserByEmail
};




