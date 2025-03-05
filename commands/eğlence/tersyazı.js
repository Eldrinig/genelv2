const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tersyazı')
        .setDescription('Metni ters çevirir')
        .addStringOption(option =>
            option
                .setName('metin')
                .setDescription('Ters çevrilecek metin')
                .setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString('metin');
        const reversedText = text.split('').reverse().join('');

        await interaction.reply(`🔄 ${reversedText}`);
    }
}; 