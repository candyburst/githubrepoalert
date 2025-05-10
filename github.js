const axios = require('axios');
const fs = require('fs');
const schedule = require('node-schedule');

// Telegram Bot API configuration
const TELEGRAM_TOKEN = "YourBotTokenfromBotfather";
const TELEGRAM_CHAT_ID = "yourtelegramchatidnumber";
const USERNAME_FILE = "usernames.txt";

// Tracking latest commit and repo IDs to avoid duplicate notifications
const latestCommitSha = {};
const latestRepoId = {};

const loadUsernames = () => {
    if (!fs.existsSync(USERNAME_FILE)) {
        fs.writeFileSync(USERNAME_FILE, ''); // Create file if it does not exist
    }
    return fs.readFileSync(USERNAME_FILE, 'utf8')
        .split('\n')
        .filter(line => line.trim());
};

const updateUsernameFile = (entries) => {
    fs.writeFileSync(USERNAME_FILE, entries.join('\n') + '\n');
};

const addEntry = (entryType, name) => {
    const entries = loadUsernames();
    const entry = `${entryType}:${name}`;
    if (!entries.includes(entry)) {
        entries.push(entry);
        updateUsernameFile(entries);
        console.log(`Added ${entryType} '${name}' to tracking.`);
    } else {
        console.log(`${entryType.charAt(0).toUpperCase() + entryType.slice(1)} '${name}' is already being tracked.`);
    }
};

const removeEntry = (entryType, name) => {
    const entries = loadUsernames();
    const entry = `${entryType}:${name}`;
    const index = entries.indexOf(entry);
    if (index > -1) {
        entries.splice(index, 1);
        updateUsernameFile(entries);
        console.log(`Removed ${entryType} '${name}' from tracking.`);
    } else {
        console.log(`${entryType.charAt(0).toUpperCase() + entryType.slice(1)} '${name}' is not being tracked.`);
    }
};

const sendTelegramMessage = async (message) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await axios.post(url, { chat_id: TELEGRAM_CHAT_ID, text: message });
        console.log("Notification sent successfully.");
    } catch (error) {
        console.error(`Failed to send notification: ${error.message}`);
    }
};

const fetchGitHubData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch data from ${url}: ${error.message}`);
        return null;
    }
};

const getLatestRepo = async (entryType, name) => {
    const url = `https://api.github.com/${entryType === 'user' ? 'users' : 'orgs'}/${name}/repos?sort=created`;
    const repos = await fetchGitHubData(url);
    if (repos && repos.length > 0) {
        const latestRepo = repos[0];
        const { id: repoId, name: repoName, html_url: repoUrl } = latestRepo;
        if (!latestRepoId[name] || repoId !== latestRepoId[name]) {
            latestRepoId[name] = repoId;
            await sendTelegramMessage(`New Repository by ${entryType.charAt(0).toUpperCase() + entryType.slice(1)} '${name}': ${repoName}\n${repoUrl}`);
        }
    }
};

const getLatestCommit = async (entryType, name) => {
    const url = `https://api.github.com/${entryType === 'user' ? 'users' : 'orgs'}/${name}/events`;
    const events = await fetchGitHubData(url);
    if (events) {
        for (const event of events) {
            if (event.type === "PushEvent") {
                const commit = event.payload.commits.slice(-1)[0];
                const { sha: commitSha, message: commitMessage } = commit;
                const repoName = event.repo.name;
                if (!latestCommitSha[name] || commitSha !== latestCommitSha[name]) {
                    latestCommitSha[name] = commitSha;
                    await sendTelegramMessage(`New Commit in ${entryType.charAt(0).toUpperCase() + entryType.slice(1)} '${name}/${repoName}': ${commitMessage}`);
                }
                break;
            }
        }
    }
};

const updateAuthors = async () => {
    const entries = loadUsernames();
    for (const entry of entries) {
        const [entryType, name] = entry.split(":");
        await getLatestCommit(entryType, name);
        await getLatestRepo(entryType, name);
    }
};

// Schedule repository updates every 2 hours
schedule.scheduleJob('0 */2 * * *', updateAuthors);

const main = async () => {
    console.log("Starting the bot...");
    await sendTelegramMessage("\uD83D\uDE80 GitHub Tracker Bot is now running!");
};

main().catch(err => console.error(`Error in main: ${err.message}`));
