import { createReadStream } from "node:fs"
import { finished } from "stream/promises"
import { parse } from "csv-parse"
import { DbHelper } from "./lib/dbHelper.js"
import pg from "pg"

const pool = new pg.Pool({
  host: "localhost",
  port: 54320,
  database: "slack_stats",
  user: "postgres",
  password: "postgres",
})
const input = process.argv.length > 2 ? process.argv[2] : "./input.csv"

await main()

async function main() {
  try {
    const records = await parseCSV(input)
    console.log(`  ✔️  Parsed   ${records.length} records from CSV`)

    const inserted = await new DbHelper(pool).init(records)
    console.log(`  ✔️  Inserted ${inserted} records into database`)
  } catch (error) {
    console.log(error.stack)
  } finally {
    pool.end()
  }
}

async function parseCSV(csvPath) {
  const parserOptions = { delimiter: ",", columns: true }
  const parser = createReadStream(csvPath).pipe(parse(parserOptions))
  const records = []

  parser.on("readable", () => {
    let record
    while ((record = parser.read()) !== null) records.push(record)
  })

  await finished(parser)
  return records
}
