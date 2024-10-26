## A backend for simple/boilerplate portal

Simple backend written in javascript and using sqlite as db

#### Getting Started

Clone this repo and npm install it

```
git clone https://github.com/khairizalkhalid/simple-backend
cd simple-backend
npm install
```

#### Usage

Run this project with
```
npm run start
```

You now can do http request to http://localhost:3000

#### CORS and Custom Port

If you want to set your own port, simply go to src/index.js and change the port variable.
```
const port = 3000;
```

If you encounter CORS warning when calling from your frontend browser, change the origin port reflecting what you are using
```
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);
```

#### Default User Login Request
```
{
  email: admin
  password: admin123
}
```
