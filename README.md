# Checkout hosted version

https://nc-news-8ork.onrender.com

# About this project

This project is an API that gives access to different resources within a web application, designed to function like a social network forum.
It offers endpoints for managing content and interactions, facilitating features such as posting articles, commenting on articles, voting on content, etc.
More details about the endpoints can be found at endpoints.json.

# Instructions for install and set up

node v>=10.4 and postgres v>= 8.7.3

1. Clone the repository

2. Install dependencies by running command $ npm install

3. Create the environment variables

You will need to create two .env files for your project: .env.test and .env.development. Into each, add PGDATABASE=, with the correct database name for that environment.

Create .env.production file in which you will add DATA_URL=, with the correct link of your production database.

4. Set up database by running command $ npm run setup-dbs

5. Seed the database by running command $ npm run seed

6. Seed the production database by running $ npm run seed-prod

