# Project Name: ViewTube 


## Project Summary:
This project is a comprehensive backend application built using Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt, and other technologies. It aims to create a full-fledged video hosting website similar to YouTube with features like user authentication, video upload, like/dislike, commenting, tweeting, subscribing, and more.

## Key Features:
- User authentication using JWT and Bcrypt for secure password hashing.
- Video upload functionality.
- Like and dislike videos.
- Commenting on videos.
- Tweeting and subscribing to other users.
- Utilizes standard practices such as access tokens and refresh tokens.

## Project Duration:
I've dedicated over a month to develop and refine this project.

## Model Design Link:
You can view the design model for this project [here](https://app.eraser.io/workspace/IjuDeHAW1WwnKRJ6Oc0R?origin=share).

## Postman File:
Included in this repository is a Postman collection file (`ViewTube.postmanCollection.json`) for testing and interacting with the backend API.


## Installation:
1. Clone the repository: `git clone https://github.com/mananatal/ViewTube.git`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Environment Variables:

To run this project, you will need to set up the following environment variables in a `.env` file at the root of your project:

- `PORT`: The port number on which the server will run (default: `8000`).
- `MONGODB_URL`: The connection URI for your MongoDB database.
- `CORS_ORIGIN`: The allowed origin for Cross-Origin Resource Sharing (CORS) (default: `*`).
- `ACCESS_TOKEN_SECRET`: Secret key for generating access tokens.
- `ACCESS_TOKEN_EXPIRE_TIME`: Expiry time for access tokens (e.g., `1d` for 1 day).
- `REFRESH_TOKEN_SECRET`: Secret key for generating refresh tokens.
- `REFRESH_TOKEN_EXPIRE_TIME`: Expiry time for refresh tokens (e.g., `10d` for 10 days).
- `CLOUD_NAME`: Cloudinary cloud name for image/video hosting.
- `API_KEY`: Cloudinary API key.
- `API_SECRET`: Cloudinary API secret.

Example `.env` file:

```plaintext
MONGODB_URL=mongodb+srv://username:password@cluster0.mongodb.net/dbname
CORS_ORIGIN=*
PORT=8000
ACCESS_TOKEN_EXPIRE_TIME=1d
ACCESS_TOKEN_SECRET=bfdvsdvmsdkvojpsdjvsdpojvosdvopbjsdpojvposdjca500b40cadf1605292a736f7374f0c38dfa@45vsdv
REFRESH_TOKEN_EXPIRE_TIME=10d
REFRESH_TOKEN_SECRET=bfdvsdvmsdkvojpsdjvsdpojvosdvopbjsdpojvposdjca500b40cadf1605292a736f7374f0c38dfa@45vsdv
CLOUD_NAME=desdvvdsn
API_KEY=7344565656262125
API_SECRET=cWALhsdvsdvsdvsdv56_A1vRj6pymO8
```

## Usage:
1. Ensure MongoDB is running.
2. Start the server using the provided start script.
3. Access the API endpoints using tools like Postman or integrate them into your frontend application.

## Contributing:
Contributions are welcome! Feel free to open issues or submit pull requests to help improve this project.

## Feedback and Contact:
I welcome any feedback or suggestions for improving this project. If you have questions, ideas, or just want to connect, feel free to reach out to me via email at [mananatal25@gmail.com](mailto:mananatal25@gmail.com) or through my [GitHub profile](https://github.com/mananatal).

Thank you for your interest in ViewTube!

