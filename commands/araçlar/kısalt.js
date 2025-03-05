const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kısalt')
        .setDescription('URL kısaltma')
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('Kısaltılacak URL')
                .setRequired(true)),

    async execute(interaction) {
        const url = interaction.options.getString('url');
        
        try {
            const response = await axios.post('https://tinyurl.com/api-create.php', null, {
                params: { url }
            });

            const embed = new EmbedBuilder()
                .setTitle('🔗 URL Kısaltıldı')
                .addFields(
                    { name: 'Orijinal URL', value: url },
                    { name: 'Kısa URL', value: response.data }
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'URL kısaltılırken bir hata oluştu.',
                ephemeral: true
            });
        }
    }
}; 