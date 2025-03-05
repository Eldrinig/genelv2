const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('destek-istatistik-sifirla')
        .setDescription('Tüm destek talebi istatistiklerini sıfırlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Yönetici veya sunucu sahibi kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && 
            interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!',
                ephemeral: true
            });
        }

        const stats = {
            totalTickets: 0,
            openTickets: 0,
            closedTickets: 0,
            categoryStats: {},
            userTickets: {}
        };

        fs.writeFileSync('./data/stats.json', JSON.stringify(stats, null, 2));

        await interaction.reply({
            content: 'Tüm destek talebi istatistikleri sıfırlandı.',
            ephemeral: true
        });
    }
}; 