/**
 * Return the spectrum and ratings in the URL. 
 *
 * Page 1: Select Spectrum: index.html
 * Page 2: Enter Ratings: index.html?covid_19
 * Page 3: Share Spectrum: index.html#Hdh363f393j43f34f43f43
 *
 * Return: 
 *  - spectrum object from spectrums.js
 *  - ratings object
 *  - locked (bool) for whether page data can be changed
 */

import { addDivider } from "./ratings";

function readUrl(spectrums) {
  const search = window.location.search.slice(1);
  const hash = window.location.hash.slice(1);
  if (search && search in spectrums) {
    //  Initialise ratings with random values
    const statements = addDivider(spectrums[search].statements);
    const randomRatings = Object.keys(statements).reduce((acc, id) => {
      acc[id] = Math.floor(Math.random() * 9) + 1;  // 1..9
      return acc;
    }, {});
    randomRatings['__'] = 10;
    return [spectrums[search], randomRatings, false];
  } else if (hash) {
    //  Read ratings from URI 
    const uri = decodeURIComponent(escape(window.atob(hash)));
    const storedRatings = uri.split('&').reduce((acc, pair) => {
      const [key, val] = pair.split('=');
      acc[key] = Number.isInteger(parseInt(val)) ? parseInt(val) : val;
      return acc;
    }, {});
    if ("ID" in storedRatings) {
      const search = storedRatings["ID"];
      return [spectrums[search], storedRatings, true];
    }
  }
  return [null, null, false]
}

function writeUrl(spectrum, ratings) {
  const urlParts = Object.entries(ratings).map(([id, confidence]) => {
    return '&' + id + '=' + confidence;
  });
  const data = 'ID=' + spectrum.id + urlParts.join('');
  return '/index.html#' + encodeBase64(data);
}

function encodeBase64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

export { readUrl, writeUrl };
