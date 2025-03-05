const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const choices = ['taş', 'kağıt', 'makas'];
const emojis = {
    'taş': '🪨',
    'kağıt': '📄',
    'makas': '✂️'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taş-kağıt-makas')
        .setDescription('Taş kağıt makas oynar')
        .addStringOption(option =>
            option
                .setName('seçim')
                .setDescription('Seçiminiz')
                .setRequired(true)
                .addChoices(
                    { name: '🪨 Taş', value: 'taş' },
                    { name: '📄 Kağıt', value: 'kağıt' },
                    { name: '✂️ Makas', value: 'makas' }
                )),

    async execute(interaction) {
        const playerChoice = interaction.options.getString('seçim');
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        let result;
        let color;

        if (playerChoice === botChoice) {
            result = 'Berabere!';
            color = '#ffff00';
        } else if (
            (playerChoice === 'taş' && botChoice === 'makas') ||
            (playerChoice === 'kağıt' && botChoice === 'taş') ||
            (playerChoice === 'makas' && botChoice === 'kağıt')
        ) {
            result = 'Kazandın! 🎉';
            color = '#00ff00';
        } else {
            result = 'Kaybettin! 😢';
            color = '#ff0000';
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Taş Kağıt Makas')
            .addFields(
                { name: 'Senin Seçimin', value: `${emojis[playerChoice]} ${playerChoice}`, inline: true },
                { name: 'Benim Seçimim', value: `${emojis[botChoice]} ${botChoice}`, inline: true },
                { name: 'Sonuç', value: result }
            )
            .setColor(color)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 