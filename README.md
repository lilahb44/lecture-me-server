# Lecture Me Server

> LectureMe is an app that assists hosts to organize a meeting with the ability to manage a group, create a survey, invite a lecturer and handle payment through the site.

## Table of contents

- [General info](#general-info)
- [Technologies](#technologies)
- [Folders](#folders)
- [Screenshots](#screenshots)
- [Setup](#setup)
- [Features](#features)
- [Status](#status)
- [Inspiration](#inspiration)
- [Contact](#contact)

## General info

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- The LectureMe app supports various mobile and browsers.
- The site supports in user mode. We have one user who already signed in to our system. On login page use the following details:
  - Username: example_user@gmail.com
  - Password: 123456

* The details above will help you to manage a group, create a survey, invite a lecturer and handle payment through the site.

## Technologies

- Back-end : Node.js ,MySQL ,Express
- Front-end : React.js , Hooks, CSS ,HTML5, Material-ui, Bootstrap.
- 3rd party SDKs: SendGrid, PayPal

## Folders:

- Providers: All our 3rd party SDKs configurations. Returns a configured, ready to use SDK.
- Routes: Seperated to 3 according to authentication level.
  - publicApi - Open routes (register, sign-in, etc)
  - userApi - Open only for logged-in users (groups, surveys, etc)
  - voteApi - Open only for Voters.

## Screenshots

![Example screenshot](./manageagroup.png)
![Example screenshot](./addguests.png)
![Example screenshot](./createasurvey.png)

## Setup

To run this project, install it locally using npm:

```
$ cd ../lecture-me-server
$ npm install
$ npm start
```

## Code Examples

## Features

List of features ready and TODOs for future development

- Create a survey to guests that it sent to their email with sendgrid.

To-do list:

- Make a user for lecturer.
- Create calender for lecturer in the site.

## Status

Project is: _in progress_

## Inspiration

Based on the idea I thought after I heard from my parents they host a group of friends and invite a lecturer during the meeting.
I decided to make them a friendly website they can create a group, make a survey and handle a group payment with PayPal.

## Contact

Created by [@lilahb44](lilahb44@gmail.com) - feel free to contact me!
