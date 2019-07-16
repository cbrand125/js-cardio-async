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

function log(value) {
  return fs.appendFile('log.txt', `${value} ${Date.now()}\n`);
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
  const log = fs.writeFile('./log.txt', '');
  return Promise.all([andrew, scott, post, log]);
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
    await log(`ERROR no such file or directory ${file}`);
  }
  /* Promise-based approach
  return fs
    .readFile(file, 'utf8')
    .then(data => {
      const parsed = JSON.parse(data);
      const value = parsed[key];
      if (!value) return log(`ERROR ${key} invalid key on ${file}`);
      return log(value);
    })
    .catch(err => log(`ERROR no such file or directory ${file}`));
  */
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
  } catch (err) {
    await log(`ERROR no such file or directory ${file}`);
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
  } catch (err) {
    await log(`ERROR no such file or directory ${file}`);
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
  } catch {
    await log(`ERROR no such file or directory ${file}`);
  }
}

/**
 * Creates file with an empty object inside.
 * Gracefully errors if the file already exists.
 * @param {string} file JSON filename
 */
async function createFile(file) {
  try {
    await fs.access(file);
    await log(`ERROR file or directory already exists: ${file}`);
  } catch {
    const emptyObject = {};
    await fs.writeFile(file, emptyObject);
  }
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
          await log(`ERROR reading file or directory ${files[i]}`);
        }
      }
    }
    await log(JSON.stringify(allData));
  } catch {
    await log(`ERROR reading this directory`);
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
function union(fileA, fileB) {}

/**
 * Takes two files and logs all the properties that both objects share
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *    intersect('scott.json', 'andrew.json')
 *    // ['firstname', 'lastname', 'email']
 */
function intersect(fileA, fileB) {}

/**
 * Takes two files and logs all properties that are different between the two objects
 * @param {string} fileA
 * @param {string} fileB
 * @example
 *    difference('scott.json', 'andrew.json')
 *    // ['username']
 */
function difference(fileA, fileB) {}

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
