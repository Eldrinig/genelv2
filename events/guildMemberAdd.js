const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // Otorol kontrolü
        const autoroles = JSON.parse(fs.readFileSync('./data/autorole.json', 'utf-8'));
        if (autoroles[member.guild.id]) {
            try {
                await member.roles.add(autoroles[member.guild.id]);
            } catch (error) {
                console.error('Otorol verilemedi:', error);
            }
        }

        // Hoşgeldin mesajı kontrolü
        const welcomeMessages = JSON.parse(fs.readFileSync('./data/welcome-messages.json', 'utf-8'));
        if (welcomeMessages[member.guild.id]) {
            const config = welcomeMessages[member.guild.id];
            const channel = member.guild.channels.cache.get(config.channel);
            
            if (channel) {
                const message = config.message
                    .replace('{user}', member.toString())
                    .replace('{server}', member.guild.name)
                    .replace('{memberCount}', member.guild.memberCount);

                const embed = new EmbedBuilder()
                    .setTitle('👋 Yeni Üye')
                    .setDescription(message)
                    .setColor('#00ff00')
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();

                await channel.send({ embeds: [embed] });
            }
        }
    },
}; 