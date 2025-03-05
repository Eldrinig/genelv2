const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        // Yasaklı kelime kontrolü
        const bannedWords = JSON.parse(fs.readFileSync('./data/banned-words.json', 'utf-8'));
        if (bannedWords[message.guild.id]) {
            const content = message.content.toLowerCase();
            const hasBlockedWord = bannedWords[message.guild.id].some(word => 
                content.includes(word.toLowerCase())
            );

            if (hasBlockedWord && !message.member.permissions.has('ManageMessages')) {
                await message.delete();
                const warning = await message.channel.send({
                    content: `${message.author}, yasaklı kelime kullanımı yasaktır!`
                });
                setTimeout(() => warning.delete(), 5000);
                return;
            }
        }

        // Yasaklı kanal kontrolü
        const bannedChannels = JSON.parse(fs.readFileSync('./data/banned-channels.json', 'utf-8'));
        if (bannedChannels[message.guild.id] && 
            bannedChannels[message.guild.id].includes(message.channel.id) && 
            !message.member.permissions.has('ManageMessages')) {
            await message.delete();
            const warning = await message.channel.send({
                content: `${message.author}, bu kanalda mesaj gönderme yetkiniz yok!`
            });
            setTimeout(() => warning.delete(), 5000);
        }

        // Özel komut kontrolü
        const customCommands = JSON.parse(fs.readFileSync('./data/custom-commands.json', 'utf-8'));
        if (customCommands[message.guild.id]) {
            const command = message.content.toLowerCase();
            if (customCommands[message.guild.id][command]) {
                await message.reply(customCommands[message.guild.id][command]);
            }
        }

        // Seviye sistemi
        const levels = JSON.parse(fs.readFileSync('./data/levels.json', 'utf-8'));
        if (!levels.users[message.author.id]) {
            levels.users[message.author.id] = {};
        }
        if (!levels.users[message.author.id][message.guild.id]) {
            levels.users[message.author.id][message.guild.id] = {
                xp: 0,
                level: 0,
                lastMessage: 0
            };
        }

        const userData = levels.users[message.author.id][message.guild.id];
        const now = Date.now();

        // Her 60 saniyede bir XP kazanılabilir
        if (now - userData.lastMessage >= 60000) {
            const settings = levels.settings[message.guild.id] || { multiplier: 1 };
            const xpGain = Math.floor(Math.random() * 10 + 15) * settings.multiplier;
            userData.xp += xpGain;
            userData.lastMessage = now;

            // Seviye kontrolü
            const nextLevel = (userData.level + 1) * 100;
            if (userData.xp >= nextLevel) {
                userData.level++;
                
                // Seviye atlama mesajı
                if (settings.channel) {
                    const channel = message.guild.channels.cache.get(settings.channel);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setTitle('🎉 Seviye Atlandı!')
                            .setColor('#00ff00')
                            .setDescription(`Tebrikler ${message.author}! **${userData.level}** seviyesine ulaştın!`)
                            .setTimestamp();

                        channel.send({ embeds: [embed] });
                    }
                }

                // Seviye rolü kontrolü
                if (settings.roles && settings.roles[userData.level]) {
                    const roleId = settings.roles[userData.level];
                    const role = message.guild.roles.cache.get(roleId);
                    if (role && !message.member.roles.cache.has(roleId)) {
                        message.member.roles.add(role).catch(console.error);
                    }
                }
            }

            fs.writeFileSync('./data/levels.json', JSON.stringify(levels, null, 2));
        }
    },
}; 