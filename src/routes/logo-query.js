'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const CompanyLogo = require('../model/company-logo');
const dbQuery = require('../lib/query');

const jsonParser = bodyParser.json();
const router = module.exports = new express.Router();

const runLogoQuery = (callback) => {
  const findStuff = dbQuery.find(CompanyLogo, 'buffer mimetype originalname encoding');
  // run async query
  const returnData = dbQuery.query(findStuff, function (data, error) { //eslint-disable-line
    if (error) {
      return error;
    }
    if (data) {
      // convert into iterable array
      return callback(Object.values(data));
    }
  });
};

// hand logo back to front-end for redux store state
router.get('/company-logo', jsonParser, (request, response, next) => { //eslint-disable-line
  // return all logos in db
  let query = runLogoQuery((callback, error) => { //eslint-disable-line
    const imageToReturn = callback.filter((image) => {
      if (image.originalname === 'company-logo') {
        return image;
      } // else
      return undefined;
    });
    // we can render base64 strings as <img> tags in React :)
    const convertToBase64 = Buffer.from(imageToReturn[0].buffer).toString('base64');
    return response.json({ base64: convertToBase64 });
  });
  // needs additional error handling but commit this base query for now
});
