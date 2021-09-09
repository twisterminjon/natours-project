const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/userModel');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: '../../config.env' });

// const app = require('./app');

// console.log(process.env);
const DB = process.env.DATABASE_LOCAL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection successful');
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
// console.log(users);
//IMPORT DATA INTO DATABASE
const imortData = async () => {
  try {
    // await User.create(users, { validateBeforeSave: false });
    await Tour.create(tours);
    // await Review.create(reviews);
    console.log('data suc load');
  } catch (err) {
    console.log(err);
  }
};

//delete all data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log('data suc delete');
  } catch (err) {
    console.log(err);
  }
};

// console.log(process.argv);
// deleteData();
imortData();

if (process.argv[2] === '--import') {
  imortData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
