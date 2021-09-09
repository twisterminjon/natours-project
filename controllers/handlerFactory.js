const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newDoc } });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To allow for nested Get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const numDocs = await Model.countDocuments();

    const features = new APIFeatures(Model.find(filter), req.query)
      .sort()
      .filter()
      .limitFields()
      .paginating();

    const docs = await features.query; //.explain();
    console.log(features.limit, 'limit');
    res.status(200).json({
      status: 'succes',
      results: docs.length,
      limit: features.limit,
      numDocs,
      data: { ...docs },
    });
  });
