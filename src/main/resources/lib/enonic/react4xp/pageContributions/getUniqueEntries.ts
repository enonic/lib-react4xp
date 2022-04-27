import {forceArray} from 'JS_UTILS_ALIAS/array/forceArray';


export function getUniqueEntries(
	arrayOfArrays :Array<Array<string>>,
	controlSet :Array<string>
) {
  const uniqueEntries :Array<string> = [];
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
