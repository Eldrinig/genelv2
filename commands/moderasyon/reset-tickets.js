const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('destek-sifirla')
        .setDescription('Kullanıcının destek talebi sayısını sıfırlar')
        .addUserOption(option =>
            option
                .setName('kullanici')
                .setDescription('Sıfırlanacak kullanıcı')
                .setRequired(true)
        )
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

        const targetUser = interaction.options.getUser('kullanici');
        const stats = JSON.parse(fs.readFileSync('./data/stats.json', 'utf-8'));

        if (stats.userTickets[targetUser.id]) {
            stats.userTickets[targetUser.id] = 0;
            fs.writeFileSync('./data/stats.json', JSON.stringify(stats, null, 2));
            await interaction.reply({
                content: `${targetUser.username} kullanıcısının destek talebi sayısı sıfırlandı.`,
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `${targetUser.username} kullanıcısının hiç destek talebi bulunmuyor.`,
                ephemeral: true
            });
        }
    }
}; 