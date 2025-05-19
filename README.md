# United Way
24-25 Full-Stack Web & Mobile Project in collaboration with United Way of Greater Los Angeles

## Objective
![image](https://github.com/user-attachments/assets/58f435e5-1943-44dc-8283-fbb0618ed0c8)

Our project builds on the mission to make it easier for residents to connect with small businesses, discover local events, track participation, and earn rewards through a mobile platform, and for community organizers to publish their events on a web application.

## Installation
Change directories into the repository `united-way`. 
Run the command:
```shell
cd admin-portal && npm i && cd ../mobile && npm i && cd ../server && npm i`
```
This will directly install the requisite dependencies that are listed within `package.json` to be able to run the web, mobile and server applications, respectively.

## Running web
```shell
  # Installing dependencies
  cd admin-portal
  npm i
  # Running the development build
  npm run dev
  # OR
  # Running a production build
  npx next build
  npm start
```

## Running mobile
```shell
  cd mobile
  npm i
  # Running the Expo Go
  npx expo start --tunnel
  # OR
  # Running on the iOS Simulator
  npx expo start
```

To be able to run any of the following web or mobile functionality, the server must be run with:
```shell
  cd server
  node index.js
```