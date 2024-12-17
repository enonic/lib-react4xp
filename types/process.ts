import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import {join} from 'path';
import { exit } from 'process';
import propertiesReader from 'properties-reader';
import packageJson from '../package.json';

const XP_TYPES_VERSION = packageJson.devDependencies['@enonic-types/global'];
console.info('XP_TYPES_VERSION', XP_TYPES_VERSION);

const REACT_COMPONENTS_VERSION = packageJson.devDependencies['@enonic/react-components'];
console.info('REACT_COMPONENTS_VERSION', REACT_COMPONENTS_VERSION);


function readGradleProperty(filePath: string, propertyName: string): string | null | undefined {
  try {
    const properties = propertiesReader(filePath);
    const propertyValue = properties.get(propertyName) as string | null;
    return propertyValue;
  } catch (error) {
    console.error(`Error reading Gradle property: ${error}`);
    return undefined;
  }
}

function replaceInFile(filePath: string, searchValue: string, replaceValue: string) {
  const content = readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
  writeFileSync(filePath, updatedContent, 'utf8');
}

function replaceInDir(dir: string, searchValue: string, replaceValue: string) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      replaceInDir(filePath, searchValue, replaceValue);
    } else {
      replaceInFile(filePath, searchValue, replaceValue);
    }
  });
}

// function prefixFile(filePath: string, message: string) {
//   const content = readFileSync(filePath, 'utf8');
//   const updatedContent = `${message}\n${content}`;
//   writeFileSync(filePath, updatedContent, 'utf8');
// }

function copyFile(from: string, to: string) {
  writeFileSync(to, readFileSync(from, 'utf8'), 'utf8');
}

function copyReplaceAndRename(from: string, to: string, searchValue: string, replaceValue: string) {
  const content = readFileSync(from, 'utf8');
  const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
  writeFileSync(to, updatedContent, 'utf8');
}

replaceInDir('./build/types', '/lib/enonic/react4xp', '.');
// replaceInDir('./build/types', '/lib/xp/io', '@enonic-types/lib-io');
// replaceInDir('./build/types', '/lib/xp/portal', '@enonic-types/lib-portal');

// This must come after the above replacements to avoid /lib/enonic/react4xp becoming . in the README.md
copyFile('types/README.md', 'build/types/README.md');

// prefixFile('build/types/index.d.ts', `declare global {
//   interface XpLibraries {
//     '/lib/enonic/react4xp': typeof import('./index');
//   }
// }`);

const VERSION = readGradleProperty('gradle.properties', 'version');

if (VERSION) {
	console.info('VERSION', VERSION);
	copyReplaceAndRename('types/package.template.json', 'build/types/package.json', '%VERSION%', VERSION);
} else {
	console.error('Unable to read version from gradle.properties!!!');
	exit(1);
}

// const XP_VERSION = readGradleProperty('gradle.properties', 'xpVersion');
if (XP_TYPES_VERSION) {
  	copyReplaceAndRename('build/types/package.json', 'build/types/package.json', '%XP_TYPES_VERSION%', XP_TYPES_VERSION);
} else {
  	console.error('Unable to read XP_TYPES_VERSION from package.json!!!');
	// console.error('Unable to read XP_VERSION from gradle.properties!!!');
	exit(1);
}

if (REACT_COMPONENTS_VERSION) {
	copyReplaceAndRename('build/types/package.json', 'build/types/package.json', '%REACT_COMPONENTS_VERSION%', REACT_COMPONENTS_VERSION);
} else {
	console.error('Unable to read REACT_COMPONENTS_VERSION from package.json!!!');
	exit(1);
}
