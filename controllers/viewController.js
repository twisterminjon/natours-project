const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.login = catchAsync(async (req, res) => {
  // const tours = await Tour.find();

  if (!res.locals.user) {
    res.status(200).render('login', {
      title: 'Log into your account',
      // tours,
    });
  } else {
    res.redirect('/');
  }
});

exports.ifNotLogin = catchAsync(async (req, res, next) => {
  if (req.path === '/login') return next();
  if (!res.locals.user && req.path !== '/login' && !req.path.includes('/api')) {
    res.redirect('/login');
    return next();
  }
  next();
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1)Get the data, fro the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // if (!tour) {
  //   return next(new AppError('There is no tour with that name.', 404));
  // }
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const { user } = req;
  res.status(200).render('account', {
    title: `Account settings`,
    user,
  });
});
