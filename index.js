require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let lastLiveVersion = '';

// Servidor web FALSO para Render (tiene que ir ANTES)
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot prendido 24/7 - Roblox Tracker'));
app.listen(PORT, () => console.log(`Falso web server en puerto ${PORT}`));

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    checkLiveVersion();
    setInterval(checkLiveVersion, 30000);
});

async function checkLiveVersion() {
    try {
        const res = await fetch('https://clientsettings.roblox.com/v2/client-version/WindowsPlayer');
        const data = await res.json();
        const currentVersion = data.clientVersionUpload;
        console.log(`[REVISIÓN LIVE] ${currentVersion}`);
        if (!currentVersion) return;

        const channelId = process.env.CHANNEL_ID?.trim();
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            console.log('No pude encontrar el canal con ID:', channelId);
            return;
        }

        if (lastLiveVersion === '') {
            const initEmbed = new EmbedBuilder()
              .setTitle('🟢 Rastreador LIVE Iniciado')
              .setDescription('Vigilando la versión oficial de Roblox directo de los servidores.')
              .addFields({ name: 'Versión Live Actual', value: `\`${currentVersion}\`` })
              .setColor(0x00AAFF)
              .setTimestamp();
            await channel.send({ embeds: [initEmbed] });
        } else if (currentVersion!== lastLiveVersion) {
            const updateEmbed = new EmbedBuilder()
              .setTitle('🚀 ¡Nueva Versión de Roblox LIVE!')
              .setDescription('Roblox acaba de publicar una nueva build oficial.')
              .addFields(
                    { name: 'Nueva Versión', value: `\`${currentVersion}\`` },
                    { name: 'Versión Anterior', value: `\`${lastLiveVersion}\`` }
                )
              .setColor(0x00FF66)
              .setTimestamp();
            await channel.send({ embeds: [updateEmbed] });
        }
        lastLiveVersion = currentVersion;
    } catch (e) {
        console.error('Error al consultar API de Roblox:', e.message);
    }
}

// LOGIN CON ERROR VISIBLE
const token = process.env.DISCORD_TOKEN?.trim();
if (!token) {
    console.error('ERROR: DISCORD_TOKEN no existe en Render Environment');
} else {
    client.login(token)
       .then(() => console.log('Login enviado a Discord...'))
       .catch(err => console.error('ERROR LOGIN DISCORD:', err.message, err.code));
}

client.on('error', console.error);
