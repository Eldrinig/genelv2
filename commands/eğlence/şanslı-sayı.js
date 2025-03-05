const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('şanslı-sayı')
        .setDescription('Bugün için şanslı sayını söyler'),

    async execute(interaction) {
        const user = interaction.user;
        const date = new Date();
        
        // Kullanıcı ID ve günün tarihi ile tutarlı rastgele sayı üret
        const seed = parseInt(user.id.slice(-6)) + date.getDate() + (date.getMonth() + 1);
        const luckyNumber = (seed % 100) + 1;

        const embed = new EmbedBuilder()
            .setTitle('🍀 Şanslı Sayın')
            .setDescription(`${user}, bugün için şanslı sayın: **${luckyNumber}**`)
            .setColor('#32cd32')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 