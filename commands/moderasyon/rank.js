const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Seviye bilgilerini gösterir')
        .addUserOption(option => 
            option
                .setName('kullanıcı')
                .setDescription('Bilgileri gösterilecek kullanıcı')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı') || interaction.user;
        
        // Burada seviye sistemi entegrasyonu yapılacak
        const embed = new EmbedBuilder()
            .setTitle(`${user.username} - Seviye Bilgileri`)
            .setColor('#0099ff')
            .addFields(
                { name: 'Seviye', value: '1', inline: true },
                { name: 'XP', value: '0/100', inline: true },
                { name: 'Sıralama', value: '#1', inline: true }
            )
            .setThumbnail(user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });
    }
}; 