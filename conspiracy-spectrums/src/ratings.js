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

const addDivider = (statements) => {
  return {
    ...statements,
    '__': '- - - ▲ Silly  ▼ Sensible - - -',
  };
}

const removeDivider = (statements) => {
  return statements.filter(statement => {
    return statement[0] != '__';
  })
}

const getDivider = (statements) => {
  for (let i = 0; i < statements.length; i++) {
    if (statements[i][0] == '__') {
      return statements[i][2];
    }
  }
  return 0;
}


const sortRatings = (spectrum, ratings, checked) => {
  if (ratings === null) {
    return [];
  }
  const statements = addDivider(spectrum.statements);
  const tuples = Object.entries(statements).map(([id, statement]) => {
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

const getConfidence = (sortedRatings) => {
  const rowsThatCount = removeDivider(sortedRatings);
  const sum = rowsThatCount.reduce((acc, val) => {
    return acc + val[2];
  }, 0);
  return Math.round(sum * 10 / rowsThatCount.length);
}

const getSensibility = (sortedRatings) => {
  const divider = getDivider(sortedRatings);
  const numSensible = sortedRatings
    .filter(statement => statement[0] != '__')
    .map(statement => statement[2])
    .filter(confidence => confidence > divider)
    .length;
  const numStatements = sortedRatings
    .filter(val => val[0] != '__')
    .length;
  return Math.round(numSensible * 100 / numStatements);
}

export {
  addDivider,
  getConfidence,
  getDivider,
  getSensibility,
  removeDivider,
  sortRatings
};

