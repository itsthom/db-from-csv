export class DbHelper {
  constructor(databasePool) {
    this.pool = databasePool
  }

  async init(records) {
    // TODO: would be cool to dynamically define table schema from a parsed record
    // tricky because of varying data types..would be easy if I didn't mind if
    // everything were a string
    return await this.createTable().then(() => this.insertRecords(records))
  }

  async createTable() {
    const sql = `
      DROP TABLE IF EXISTS members;
      CREATE TABLE members (
        id                            VARCHAR(255) PRIMARY KEY
        , name                        VARCHAR(255)
        , what_i_do                   VARCHAR(255)
        , username                    VARCHAR(255)
        , display_name                VARCHAR(255)
        , account_created             TIMESTAMP
        , account_claimed             TIMESTAMP
        , account_deactivated         TIMESTAMP
        , days_active                 INTEGER
        , days_active_desktop         INTEGER
        , days_active_android         INTEGER
        , days_active_ios             INTEGER
        , messages_posted             INTEGER
        , messages_posted_in_channels INTEGER
        , reactions_added             INTEGER
        , last_active                 TIMESTAMP
        , last_active_desktop         TIMESTAMP
        , last_active_android         TIMESTAMP
        , last_active_ios             TIMESTAMP
      );
      `.trim()
    return this.queryPool(sql)
  }

  async queryPool(query) {
    return this.pool.connect().then((client) => {
      return client
        .query(query)
        .then((result) => {
          client.release()
          return result.rowCount
        })
        .catch((err) => {
          client.release()
          console.log(err.stack)
          throw err
        })
    })
  }

  async insertRecords(records) {
    const count = await Promise.all(
      records.map(async (r) => this.insertParsedRecord(r))
    ).then((result) => result.reduce((a, b) => a + b, 0))
    return count
  }

  async insertParsedRecord(r) {
    const query = {
      text: `
        INSERT INTO members (
          id
          , name
          , what_i_do
          , username
          , display_name
          , account_created
          , account_claimed
          , account_deactivated
          , days_active
          , days_active_desktop
          , days_active_android
          , days_active_ios
          , messages_posted
          , messages_posted_in_channels
          , reactions_added
          , last_active
          , last_active_desktop
          , last_active_android
          , last_active_ios
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19);
      `,
      values: [
        r["User ID"],
        r["Name"],
        r["What I Do"],
        r["Username"],
        r["Display name"],
        parseDate(r["Account created (UTC)"]),
        parseDate(r["Claimed Date (UTC)"]),
        parseDate(r["Deactivated date (UTC)"]),
        r["Days active"],
        r["Days active (Desktop)"],
        r["Days active (Android)"],
        r["Days active (iOS)"],
        r["Messages posted"],
        r["Messages posted in channels"],
        r["Reactions added"],
        parseDate(r["Last active (UTC)"]),
        parseDate(r["Last active (Desktop] (UTC)"]),
        parseDate(r["Last active (Android] (UTC)"]),
        parseDate(r["Last active (iOS] (UTC)"]),
      ],
    }
    return this.queryPool(query)
  }
}

function parseDate(date) {
  if (!date) {
    return null
  }
  return new Date(Date.parse(date))
}
