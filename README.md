## 📜 Description

API developed with NestJS, TypeORM, and SQLite that imports movie data and provides an endpoint to identify producers with the shortest and longest intervals between award wins.

## 🚀 Project setup

```bash
$ npm install
```

### ⚙️ Environment variables

Configure the environment variables in the `.env` file.

```bash
# .env
LOG_LEVEL=debug
DATASET=movielist.csv
```

| Name        | Description                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `LOG_LEVEL` | Log level for the application. Default is `debug` for development and `log` for production.                  |
| `DATASET`   | The csv filename that will be inserted on database as soon as the project starts. Default is `movielist.csv` |

### 🔨 Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🧪 Run tests

```bash
# integration tests
$ npm run test

# test coverage
$ npm run test:cov
```

## 📡 API Endpoint

### `GET /awards/intervals`

Returns the producers with the **shortest** and **longest** intervals between two consecutive wins.

#### ✅ Example response:

```json
{
  "min": [
    {
      "producer": "Producer A",
      "interval": 1,
      "previousWin": 2000,
      "followingWin": 2001
    }
  ],
  "max": [
    {
      "producer": "Producer B",
      "interval": 10,
      "previousWin": 1990,
      "followingWin": 2000
    }
  ]
}
```

- `producer`: The producer's name.
- `interval`: Number of years between two consecutive wins.
- `previousWin`: The year of the previous winning movie.
- `followingWin`: The year of the next winning movie.

#### 🧠 Business logic:

- Only producers with **at least two wins** are considered.
- Multiple producers can be returned if they share the same `min` or `max` interval.

## 📦 Tools

Check out the tools used in this project:

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [SQLite](https://www.sqlite.org/)
- [csv-parser](https://www.npmjs.com/package/csv-parser)
- [Jest](https://jestjs.io/)

## 👤 Stay in touch

- [LinkedIn](https://www.linkedin.com/in/rafael-tapia)
- [Email](mailto:rafaelsilvatapia@gmail.com)
