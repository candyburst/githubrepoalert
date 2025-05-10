# GitHub Tracker Bot

A Node.js bot for tracking GitHub activities (new repositories and commits) of users or organizations and sending updates as Telegram notifications.

## Features
- Track new repositories created by GitHub users or organizations.
- Track new commits in repositories of GitHub users or organizations.
- Sends updates to a specified Telegram chat via a Telegram Bot.
- Automatically checks for updates every 2 hours using a scheduler.

## Requirements
- [Node.js](https://nodejs.org/) (version 14 or later)
- A Telegram Bot Token (obtainable via [BotFather](https://core.telegram.org/bots#botfather))
- A Telegram Chat ID to receive notifications

## Installation
1. Clone or download this repository.
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up a `usernames.txt` file in the root directory to list GitHub users and organizations to track. Each entry should be in the format:
   ```
   user:username
   org:organization
   ```

## Configuration
Update the following placeholders in the code with your details:
- `TELEGRAM_TOKEN`: Your Telegram Bot Token.
- `TELEGRAM_CHAT_ID`: Your Telegram Chat ID.

## Usage
1. Start the bot:
   ```bash
   npm start
   ```
2. The bot will send a startup message to the specified Telegram chat and begin tracking activities.

### Adding a User or Organization to Track
To add a GitHub user or organization, modify the `usernames.txt` file and restart the bot.

### Removing a User or Organization
To stop tracking a GitHub user or organization, remove the entry from the `usernames.txt` file and restart the bot.

## Scheduled Updates
The bot checks for updates every 2 hours by default. This interval can be adjusted in the code by modifying the scheduling rule:
```javascript
schedule.scheduleJob('0 */2 * * *', updateAuthors);
```

## Dependencies
- [axios](https://www.npmjs.com/package/axios): HTTP client for making API requests.
- [node-schedule](https://www.npmjs.com/package/node-schedule): Scheduler for running periodic tasks.

## License
This project is licensed under the MIT License.

## Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## Author
Candyburst
