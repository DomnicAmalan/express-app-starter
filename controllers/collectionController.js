const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {MongoClient} = require('mongodb')
const moment =require('moment')

exports.getAllCollection = catchAsync(async (req, res, next) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    let page = Number(req?.query?.page) + 1 || 1
    page = page * 100
    await client.connect();
    const db = client.db("collection")
    const collection = db.collection('collections');
    const data = await collection.find({
      '$or': [
        { 'registration_closes': { '$gte': moment.utc().toDate() } },
        { 'registration_closes': null },
      ],
      'registration_status': { '$in': ["open", "unknown"] },
    },
      {
        projection: { _id: 0 }
      }
    )
    const total = await data?.count()
    const resp = await data.limit(100).skip(page).toArray()
    client.close()
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ data: resp, total, page: page, limit: 100 })
  } catch (e) {
    console.log(e)
    return next(
      new AppError(`${e.message}`, 404)
    );
  }
});
