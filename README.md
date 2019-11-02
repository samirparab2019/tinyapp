# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs. 

This four-day project will have you building a web app using Node. The app will allow users to shorten long URLs much like TinyURL.com and bit.ly do.

You will build an HTTP Server that handles requests from the browser (client). Along the way you'll get introduced to some more advanced JavaScript and Node concepts, and you'll also learn more about Express, a web framework which is very popular in the Node community.

## Final Product

!["Login Page"](https://github.com/samirparab2019/tinyapp/blob/master/docs/Login.png)
!["Registration Page"](https://github.com/samirparab2019/tinyapp/blob/master/docs/Register.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Functional Requirements

I want to be able to create short links when i visit - http://localhost:8080/.
After I register and login, I see a "create new URL" form. 
Once I fill the URL and submit, it returns a short URL link for the original URL.
Also, it provides me an option to edit the URL but keeps the shrort URL same.
Under My URLs, I can see all URLS I created.
When I click the short link, I am redirected to the page to the short URL's original URL.

## Site Header

if a user is logged in, the header shows: the user's email and a logout button which makes a POST request to /logout.
if a user is not logged in, the header shows: a link to the login page (/login) and a link to the registration page (/register).
  
