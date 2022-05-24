# DB From CSV

Eventually I'd like this to be a quick, general purpose tool for when I want to use SQL on data that can be easily exported to a CSV file. Right now it just does slack member metrics.

Entry point is [./start](./start). Running this script will:
- Pull down dependencies
- Stand up a postgres database container
- Populate it from the CSV
- Tell you how to connect to it
- Stand up a sqlpad container for convenience

## Requirements

- Docker
- Nodejs

## How Do

1. Browse to Slack Analytics and view Members: `https://<YOUR ORG>.slack.com/stats#members`
1. "Edit columns" -> "Select all" -> "Close"
1. Set the date range you're interested in
1. "Export CSV"
1. Slackbot will DM you the CSV when it's ready
1. Replace [input.csv](./input.csv) with the thing you just downloaded
1. run `./start`
1. Script will print a few ways to access data

Alternatively, run the script as is with the sample input and then run just the parsing script passing your CSV as an argument, e.g. `./start && node index.js the-csv-i-downloaded.csv`
