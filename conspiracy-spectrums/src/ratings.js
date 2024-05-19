/**
 * Ratings logic functions for Conspiracy Spectrums.
 *
 * - Ratings are a hash of {id: confidence}. 
 * - Sorted Ratings (for display) are a tuple of [id, statement, confidence]. 
 *
 * These functions work with the global variables:
 *
 * - spectrum: a data object from SPECTRUMS (spectrums.js)
 * - ratings: a signal(Ratings) object that drives rendering.
 */


function filterBetween(display, minimum, maximum) {
  return display.reduce((acc, tuple) => {
    const confidence = tuple[2];
    console.log(confidence, maximum, minimum);
    if (confidence >= minimum && confidence <= maximum) {
      return [...acc, tuple];
    } else {
      return acc;
    }
  }, []);
}

const sortRatings = (spectrum, ratings, checked) => {
  if (ratings === null) {
    return [];
  }
  const tuples = Object.entries(spectrum.statements).map(([id, statement]) => {
    return [id, statement, ratings[id]];
  });
  return tuples.sort((a, b) => {
    //  Sort by rating then statement
    if (a[2] == b[2]) {
      return a[1] > b[1] ? 1 : -1;
    } else {
      return a[2] > b[2] ? 1 : -1;
    }
  });
}


const getAverageConfidence = (sortedRatings) => {
  const sum = sortedRatings.reduce((acc, val) => {
    return val[2] == 5 ? acc : acc + val[2];
  }, 0);
  const total = sortedRatings.reduce((acc, val) => {
    return val[2] == 5 ? acc : acc + 1;
  }, 0);
  return total == 0 ? '–' : (Math.round(sum * 10 / total) / 10);
}

const getConfidence = (sortedRatings) => {
  const sum = sortedRatings.reduce((acc, val) => {
    return acc + val[2];
  }, 0);
  return Math.round(sum * 10 / sortedRatings.length);
}

const getSensibility = (sortedRatings) => {
  const numSensible = sortedRatings
    .map(statement => statement[2])
    .filter(confidence => confidence > 5)
    .length;
  const numStatements = sortedRatings.length;
  return Math.round(numSensible * 100 / numStatements);
}

export {
  filterBetween,
  getConfidence,
  getAverageConfidence,
  getSensibility,
  sortRatings
};

