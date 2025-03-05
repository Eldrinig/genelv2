const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alkış')
        .setDescription('Alkışlar!')
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Alkışlanacak kullanıcı')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const emojis = ['👏', '🎉', '🥳', '👍', '🌟'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        if (user) {
            await interaction.reply(`${randomEmoji} ${user} alkışlanıyor! 👏👏👏`);
        } else {
            await interaction.reply(`${randomEmoji} Alkış alkış! 👏👏👏`);
        }
    }
}; 