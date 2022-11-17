const express = require('express');
const collectionController = require('../controllers/collectionController');


const router = express.Router();

// router.use(protect); //  protect all router which are comming after this middleware

router
  .route('/get_all_collections')
  .get(collectionController.getAllCollection)
router
  .route('/mark_close')
  .post(collectionController.markClosedForCollections)
module.exports = router;
