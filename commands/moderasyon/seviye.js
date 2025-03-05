const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/levels.json')) {
    fs.writeFileSync('./data/levels.json', JSON.stringify({
        users: {},
        settings: {}
    }));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seviye')
        .setDescription('Seviye sistemini yönetir')
        .addSubcommand(subcommand =>
            subcommand
                .setName('bilgi')
                .setDescription('Seviye bilgilerini gösterir')
                .addUserOption(option =>
                    option
                        .setName('kullanıcı')
                        .setDescription('Bilgileri gösterilecek kullanıcı')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sıralama')
                .setDescription('Seviye sıralamasını gösterir')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const levels = JSON.parse(fs.readFileSync('./data/levels.json', 'utf-8'));

        switch (subcommand) {
            case 'bilgi': {
                const user = interaction.options.getUser('kullanıcı') || interaction.user;
                const userData = levels.users[user.id]?.[interaction.guild.id] || { xp: 0, level: 0 };
                const nextLevel = (userData.level + 1) * 100;
                const progress = Math.floor((userData.xp / nextLevel) * 100);

                const embed = new EmbedBuilder()
                    .setTitle('📊 Seviye Bilgileri')
                    .setColor('#0099ff')
                    .setThumbnail(user.displayAvatarURL())
                    .addFields(
                        { name: 'Seviye', value: userData.level.toString(), inline: true },
                        { name: 'XP', value: `${userData.xp}/${nextLevel}`, inline: true },
                        { name: 'İlerleme', value: `${progress}%`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'sıralama': {
                const guildUsers = Object.entries(levels.users)
                    .map(([userId, guilds]) => ({
                        userId,
                        ...guilds[interaction.guild.id]
                    }))
                    .filter(user => user.xp)
                    .sort((a, b) => b.xp - a.xp)
                    .slice(0, 10);

                const embed = new EmbedBuilder()
                    .setTitle('🏆 Seviye Sıralaması')
                    .setColor('#0099ff')
                    .setDescription(
                        guildUsers.length > 0
                            ? guildUsers
                                .map((user, index) => {
                                    const member = interaction.guild.members.cache.get(user.userId);
                                    return `**${index + 1}.** ${member ? member.user.tag : 'Bilinmeyen Kullanıcı'}\n└ Seviye: ${user.level} | XP: ${user.xp}`;
                                })
                                .join('\n\n')
                            : 'Henüz hiç veri yok!'
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 