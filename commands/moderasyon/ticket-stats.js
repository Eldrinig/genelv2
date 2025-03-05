const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('destek-istatistik')
        .setDescription('Destek talebi istatistiklerini gösterir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const stats = JSON.parse(fs.readFileSync('./data/stats.json', 'utf-8'));
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Destek Talebi İstatistikleri')
            .setColor('#0099ff')
            .addFields(
                { name: 'Toplam Talepler', value: stats.totalTickets.toString(), inline: true },
                { name: 'Açık Talepler', value: stats.openTickets.toString(), inline: true },
                { name: 'Kapalı Talepler', value: stats.closedTickets.toString(), inline: true }
            )
            .addFields(
                { name: 'Kategori Dağılımı', value: Object.entries(stats.categoryStats)
                    .map(([category, count]) => `${category}: ${count}`)
                    .join('\n')
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 