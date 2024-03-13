import { config } from 'dotenv'
import { Client, GatewayIntentBits } from 'discord.js'
import { google } from 'googleapis'
import { schedule } from 'node-cron'

config()

const discordClient = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
})

const youtubeClient = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

let latestVideoId = ''

discordClient.login(process.env.DISCORD_TOKEN)

discordClient.on('ready', () => {
    console.log(`Bot online, logado como: ${discordClient.user.tag}`)
    checkNewVideos()
    schedule("* * 0 * * *", checkNewVideos)
})

async function checkNewVideos() {
    try {
        const response = await youtubeClient.search.list({
            channelId: "UC7iwNp4GUynlGXvK-6KD0Rw",
            order: 'date',
            part: 'snippet',
            type: 'video',
            maxResults: 1
        }).then(res => res)
        const latestVideo = response.data.items[0]

        if(latestVideo?.id?.videoId != latestVideoId) {
            latestVideoId = latestVideo?.id?.videoId
            const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`
            const message = "Confira o ultimo video do canal!!"
            const channel = discordClient.channels.cache.get('1216552390182961228')
            channel.send(message + videoUrl)
        }
    } catch {
        console.log("Error")
    }
}