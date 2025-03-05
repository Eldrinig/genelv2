const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayarlar')
        .setDescription('Sunucu ayarlarını gösterir'),

    async execute(interaction) {
        // Tüm ayar dosyalarını oku
        const autoroles = JSON.parse(fs.readFileSync('./data/autorole.json', 'utf-8'));
        const logs = JSON.parse(fs.readFileSync('./data/logs.json', 'utf-8'));
        const prefixes = JSON.parse(fs.readFileSync('./data/prefixes.json', 'utf-8'));
        const welcomeMessages = JSON.parse(fs.readFileSync('./data/welcome-messages.json', 'utf-8') || '{}');

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Sunucu Ayarları')
            .setColor('#0099ff')
            .addFields(
                {
                    name: '🎭 Otorol',
                    value: autoroles[interaction.guild.id]
                        ? `<@&${autoroles[interaction.guild.id]}>`
                        : 'Ayarlanmamış',
                    inline: true
                },
                {
                    name: '📝 Log Kanalları',
                    value: logs.messageDelete[interaction.guild.id]
                        ? `Mesaj: <#${logs.messageDelete[interaction.guild.id]}>\nÜye: <#${logs.memberJoin[interaction.guild.id] || 'Ayarlanmamış'}>\nSunucu: <#${logs.channelCreate[interaction.guild.id] || 'Ayarlanmamış'}>`
                        : 'Ayarlanmamış',
                    inline: false
                },
                {
                    name: '⌨️ Prefix',
                    value: prefixes[interaction.guild.id]
                        ? `\`${prefixes[interaction.guild.id]}\``
                        : '`/` (varsayılan)',
                    inline: true
                },
                {
                    name: '👋 Hoşgeldin Mesajı',
                    value: welcomeMessages[interaction.guild.id]
                        ? `Kanal: <#${welcomeMessages[interaction.guild.id].channel}>\nMesaj Ayarlanmış`
                        : 'Ayarlanmamış',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

        await interaction.reply({ embeds: [embed] });
    }
}; 