const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {MongoClient} = require('mongodb')
const moment =require('moment')
const apicache = require('apicache')
exports.getAllCollection = catchAsync(async (req, res, next) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("collection")
    const collection = db.collection('collections');
    const data = await collection.find({
      '$or': [
        { 'registration_closes': { '$gte': moment.utc().toDate() } },
        {'$and': [
          { 'registration_closes': null },
          { 'created_at': { '$gte': moment.utc().subtract(60, 'days').toDate() } },
        ]},
      ],
      'registration_status': { '$in': ["open", "unknown"] },
    },
      {
        projection: { _id: 0 }
      }
    ).sort('created_at', -1).toArray()
    client.close()
    // res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data)
  } catch (e) {
    return next(
      new AppError(`${e.message}`, 404)
    );
  }
});

exports.markClosedForCollections = catchAsync(async (req, res, next) => {
  try {
    const {selected} = req?.body
    if (selected.length) {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db("collection")
      const collection = db.collection('collections');
      await collection.updateMany({
        'slug': {'$in': selected} 
      }, { $set: { registration_status: 'manually_closed' }}, {upsert: true})
      await apicache.clear()
    }
    res.status(200).json({msg: 'success'})
  } catch (e) {
    return next(
      new AppError(`${e.message}`, 404)
    );
  }
});


