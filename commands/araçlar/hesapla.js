const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const math = require('mathjs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hesapla')
        .setDescription('Matematiksel işlem yapar')
        .addStringOption(option =>
            option
                .setName('işlem')
                .setDescription('Yapılacak matematiksel işlem')
                .setRequired(true)),

    async execute(interaction) {
        const expression = interaction.options.getString('işlem');

        try {
            const result = math.evaluate(expression);
            const embed = new EmbedBuilder()
                .setTitle('🔢 Hesap Makinesi')
                .addFields(
                    { name: 'İşlem', value: `\`${expression}\`` },
                    { name: 'Sonuç', value: `\`${result}\`` }
                )
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Geçersiz işlem! Lütfen doğru bir matematiksel ifade girin.',
                ephemeral: true
            });
        }
    }
}; 