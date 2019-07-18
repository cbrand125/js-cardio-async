const fs = require('fs').promises;
/*
All of your functions must return a promise!
*/

/* 
Every function should be logged with a timestamp.
If the function logs data, then put that data into the log
ex after running get('user.json', 'email'):
  sroberts@talentpath.com 1563221866619

If the function just completes an operation, then mention that
ex after running delete('user.json'):
  user.json succesfully delete 1563221866619

Errors should also be logged (preferably in a human-readable format)
*/

async function log(value, error) {
  await fs.appendFile('log.txt', `${value} ${Date.now()}\n`);
  if (error) {
    await fs.appendFile('log.txt', `\n${error}`);
    throw error;
  }
}

/**
 * Resets the database (does not touch added files)
 */
function reset() {
  const andrew = fs.writeFile(
    './andrew.json',
    JSON.stringify({
      firstname: 'Andrew',
      lastname: 'Maney',
      email: 'amaney@talentpath.com'
    })
  );
  const scott = fs.writeFile(
    './scott.json',
    JSON.stringify({
      firstname: 'Scott',
      lastname: 'Roberts',
      email: 'sroberts@talentpath.com',
      username: 'scoot'
    })
  );
  const post = fs.writeFile(
    './post.json',
    JSON.stringify({
      title: 'Async/Await lesson',
      description: 'How to write asynchronous JavaScript',
      date: 'July 15, 2019'
    })
  );
  const logFile = fs.writeFile('./log.txt', '');
  return Promise.all([andrew, scott, post, logFile]);
}

/**
 * Logs the value of object[key]
 * @param {string} file
 * @param {string} key
 */
async function get(file, key) {
  /* Async/await approach */
  try {
    // 1. read file
    // 2. handle promise -> data
    const data = await fs.readFile(file, 'utf8');
    // 3. parse data from string -> JSON
    const parsed = JSON.parse(data);
    // 4. use the key to get the value at object[key]
    const value = parsed[key];
    // 5. append the log file with the above value
    if (!value) return log(`ERROR ${key} invalid key on ${file}`);
    return log(value);
  } catch (err) {
    return log(`ERROR no such file or directory ${file}`, err);
  }
}

/**
 * Sets the value of object[key] and rewrites object to file
 * @param {string} file
 * @param {string} key
 * @param {string} value
 */
async function set(file, key, value) {
  try {
    const data = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(data);
    parsed[key] = value;
    await fs.writeFile(file, JSON.stringify(parsed));
    return log(`${file}: ${value} wrote to ${key}`);
  } catch (err) {
    return log(`ERROR no such file or directory: ${file}`, err);
  }
}

/**
 * Deletes key from object and rewrites object to file
 * @param {string} file
 * @param {string} key
 */
async function remove(file, key) {
  try {
    const data = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(data);
    delete parsed[key];
    await fs.writeFile(file, JSON.stringify(parsed));
    return log(`${file}: ${key} removed`);
  } catch (err) {
    return log(`ERROR no such file or directory: ${file}`, err);
  }
}

/**
 * Deletes file.
 * Gracefully errors if the file does not exist.
 * @param {string} file
 */
async function deleteFile(file) {
  try {
    await fs.unlink(file);
    return log(`${file}: deleted`);
  } catch (err) {
    return log(`ERROR no such file or directory: ${file}`, err);
  }
}

/**
 * Creates file with an empty object inside.
 * Gracefully errors if the file already exists.
 * @param {string} file JSON filename
 * @content {{JSON}} content JSON object formatted content
 */
async function createFile(file, content) {
  try {
    await fs.access(file);
  } catch (err) {
    await fs.writeFile(file, JSON.stringify(content));
    return log(`${file}: created`);
  }

  return log('', Error(`ERROR file or directory already exists: ${file}`));
}

/**
 * Merges all data into a mega object and logs it.
 * Each object key should be the filename (without the .json) and the value should be the contents
 * ex:
 *  {
 *  user: {
 *      "firstname": "Scott",
 *      "lastname": "Roberts",
 *      "email": "sroberts@talentpath.com",
 *      "username": "scoot"
 *    },
 *  post: {
 *      "title": "Async/Await lesson",
 *      "description": "How to write asynchronous JavaScript",
 *      "date": "July 15, 2019"
 *    }
 * }
 */
async function mergeData() {
  try {
    const files = await fs.readdir('.');
    const allData = {};
    for (let i = 0; i < files.length; i++) {
      if (files[i].endsWith('.json') && !files[i].startsWith('package')) {
        try {
          const fileData = await fs.readFile(files[i], 'utf8');
          const fileParsed = JSON.parse(fileData);
          allData[files[i].slice(0, files[i].length - 5)] = fileParsed;
        } catch {
          await log(`ERROR reading file or directory: ${files[i]}`);
        }
      }
    }
    await fs.writeFile('merged.json', JSON.stringify(allData));
    return log(`merged.json created`);
  } catch (err) {
    return log(`ERROR reading directory`, err);
  }
}

/**
 * Takes two files and logs all the properties as a list without duplicates
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *  union('scott.json', 'andrew.json')
 *  // ['firstname', 'lastname', 'email', 'username']
 */
async function union(fileA, fileB) {
  try {
    const dataA = await fs.readFile(fileA, 'utf8');
    const parsedA = JSON.parse(dataA);
    const keysA = Object.keys(parsedA);
    const dataB = await fs.readFile(fileB, 'utf8');
    const parsedB = JSON.parse(dataB);
    const keysB = Object.keys(parsedB);
    const unionData = {};

    keysA.forEach(value => {
      unionData[value] = '';
    });
    keysB.forEach(value => {
      unionData[value] = '';
    });

    await fs.writeFile('union.txt', Object.keys(unionData));
    return log(`${fileA} and ${fileB}: union.txt created`);
  } catch (err) {
    return log(`ERROR reading file or directory ${fileA} or ${fileB}`, err);
  }
}

/**
 * Takes two files and logs all the properties that both objects share
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *    intersect('scott.json', 'andrew.json')
 *    // ['firstname', 'lastname', 'email']
 */
async function intersect(fileA, fileB) {
  try {
    const dataA = await fs.readFile(fileA, 'utf8');
    const parsedA = JSON.parse(dataA);
    const keysA = Object.keys(parsedA);
    const dataB = await fs.readFile(fileB, 'utf8');
    const parsedB = JSON.parse(dataB);
    const keysB = Object.keys(parsedB);
    const intersectData = {};

    keysA.forEach(value => {
      if (parsedB[value]) {
        intersectData[value] = '';
      }
    });

    await fs.writeFile('intersect.txt', Object.keys(intersectData));
    return log(`${fileA} and ${fileB}: intersect.txt created`);
  } catch (err) {
    return log(`ERROR reading file or directory ${fileA} or ${fileB}`, err);
  }
}

/**
 * Takes two files and logs all properties that are different between the two objects
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *    difference('scott.json', 'andrew.json')
 *    // ['username']
 */
async function difference(fileA, fileB) {
  try {
    const dataA = await fs.readFile(fileA, 'utf8');
    const parsedA = JSON.parse(dataA);
    const keysA = Object.keys(parsedA);
    const dataB = await fs.readFile(fileB, 'utf8');
    const parsedB = JSON.parse(dataB);
    const keysB = Object.keys(parsedB);
    const differentData = {};

    keysA.forEach(value => {
      if (!parsedB[value]) {
        differentData[value] = '';
      }
    });
    keysB.forEach(value => {
      if (!parsedA[value]) {
        differentData[value] = '';
      }
    });

    await fs.writeFile('difference.txt', Object.keys(differentData));
    return log(`${fileA} and ${fileB}: difference.txt created`);
  } catch (err) {
    return log(`ERROR reading file or directory ${fileA} or ${fileB}`, err);
  }
}

module.exports = {
  get,
  set,
  remove,
  deleteFile,
  createFile,
  mergeData,
  union,
  intersect,
  difference,
  reset
};
