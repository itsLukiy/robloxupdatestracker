require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let lastLiveVersion = '';

client.once('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
    checkLiveVersion();
    setInterval(checkLiveVersion, 30000); // cada 30s consulta a Roblox
});

async function checkLiveVersion() {
    try {
        const res = await fetch('https://clientsettings.roblox.com/v2/client-version/WindowsPlayer');
        const data = await res.json();

        const currentVersion = data.clientVersionUpload; // ej: version-6a1c4e3e7b8a4d2c...
        console.log(`[REVISIÓN LIVE] ${currentVersion}`);

        if (!currentVersion) return;

        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        if (!channel) return;

        if (lastLiveVersion === '') {
            const initEmbed = new EmbedBuilder()
               .setTitle('🟢 Rastreador LIVE Iniciado')
               .setDescription('Vigilando la versión oficial de Roblox directo de los servidores.')
               .addFields({ name: 'Versión Live Actual', value: `\`${currentVersion}\`` })
               .setColor('#00AAFF')
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
               .setColor('#00FF66')
               .setTimestamp();
            await channel.send({ embeds: [updateEmbed] });
        }

        lastLiveVersion = currentVersion;

    } catch (e) {
        console.error('Error al consultar API de Roblox:', e.message);
    }
}

client.login(process.env.DISCORD_TOKEN);

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot prendido 24/7'));
app.listen(PORT, () => console.log(`Falso web server en puerto ${PORT}`));