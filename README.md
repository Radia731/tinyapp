
# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly)

TinyApp is a simple URL shortening web application that allows users to shorten long URLs into short, manageable links. This repository contains the server-side code for TinyApp.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- nodemon 

## Features

- Register an account and log in securely.
- Create, edit, and delete shortened URLs associated with your account.
- View and manage your list of shortened URLs.
- Visit the shortened URLs and get redirected to the original long URLs.
- JSON API endpoints to access the URL database and user information.

## Prerequisites

- Node.js (v12 or above)
- npm (Node package manager)

Configuration
TinyApp uses environment variables for configuration. Create a .env file in the project root directory and set the following variables:

SESSION_SECRET: A secret key for encrypting session data.
PORT: The port number on which the server should run (default: 4999).
Folder Structure
views/: Contains the EJS templates for the web pages.
public/: Stores static files like stylesheets and images.
routes/: Defines the server routes and handlers for different endpoints.
helpers/: Contains helper functions for user and URL management.
middleware/: Custom middleware functions used in the application.
data.js: In-memory data storage for URLs and user information.
app.js: Entry point of the application.


##screenshots 

##Screnshots 
![Screenshot 2023-05-19 at 6 35 13 PM](https://github.com/Radia731/tinyapp/assets/126217826/edc7bfbd-808a-4e47-ad48-e1af7649e4a6)
![Screenshot 2023-05-19 at 6 42 25 PM](https://github.com/Radia731/tinyapp/assets/126217826/93ee5d31-0a3c-468e-bc53-33fc35f0da6e)
![Screenshot 2023-05-19 at 6 42 55 PM](https://github.com/Radia731/tinyapp/assets/126217826/0aa83ec3-aed8-429f-814a-67534dbfbf1e)
![Screenshot 2023-05-19 at 6 43 04 PM](https://github.com/Radia731/tinyapp/assets/126217826/05593ef4-41b9-47eb-b980-f63c92585ec0)
