import {forceArray} from '@enonic/js-utils/array/forceArray';


export function getUniqueEntries(
	arrayOfArrays :Array<Array<string>>,
	controlSet :Array<string>
) {
  const uniqueEntries = [];
  arrayOfArrays.forEach(arr => {
    forceArray(arr).forEach(item => {
      if (controlSet.indexOf(item) === -1) {
        uniqueEntries.push(item);
        controlSet.push(item);
      }
    });
  });
  return uniqueEntries;
}
