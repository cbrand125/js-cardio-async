const db = require('./db');
const fs = require('fs').promises;

exports.getHome = (request, response) => {
  response.writeHead(200, {
    'my-custom-header': 'This is a great API',
    'another-header': 'More metadata'
  });
  return response.end('Welcome to my server');
};

exports.getStatus = (request, response) => {
  const status = {
    up: true,
    owner: 'Cody Brand',
    timestamp: Date.now()
  };

  response.writeHead(200, {
    'Content-Type': 'application/json'
  });

  return response.end(JSON.stringify(status));
};

exports.patchSet = (request, response, { file, key, value }) => {
  if (!file || !key || !value) {
    response.writeHead(400);
    response.end(`Invalid arguments`);
  }

  db.set(file, key, value)

    .then(() => {
      response.end(`${file}: Successfully set ${key} to ${value}`);
    })

    .catch(err => {
      response.writeHead(400);
      response.end(`${file}: File not found`);
    });
};

exports.notFound = async (request, response) => {
  response.writeHead(404, {
    'Content-Type': 'text/html'
  });
  response.end(await fs.readFile('404.html'));
};

exports.postWrite = (request, response, pathname) => {
  const file = pathname.split('/')[2];
  const data = [];

  if (!file || !file.endsWith('.json')) {
    return this.notFound(request, response);
  }

  request.on('data', chunk => data.push(chunk));
  request.on('end', async () => {
    try {
      const body = JSON.parse(data);
      await db.createFile(file, body);
      response.writeHead(201);
      response.end(`${file}: Successfully created`);
    } catch (err) {
      response.writeHead(400);
      response.end(
        `${file}: Unable to create. Malformed data or file already exists`
      );
    }
  });
};
