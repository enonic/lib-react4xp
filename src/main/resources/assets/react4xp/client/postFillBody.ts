import type {
	Region,
	RegionsBuffer,
	RegionsRemaining
} from './index.d';


export const postFillBody = (
  componentPath :string,
  htmlBody :string,
  region :Region,
  regionName :string,
  regionsBuffer :RegionsBuffer,
  regionsRemaining :RegionsRemaining
) => {
  if (htmlBody) {
    // TODO: Error if no body?
    const compTag = `<!--# COMPONENT ${componentPath} -->`.replace(/\//g, "/");

    regionsBuffer[regionName] = regionsBuffer[regionName].replace(
      new RegExp(compTag),
      htmlBody
    );

    if (regionsRemaining[regionName] === 0) {
      region.innerHTML = regionsBuffer[regionName];
    }
  }
};
