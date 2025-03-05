const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wikipedia')
        .setDescription('Wikipedia\'da arama yapar')
        .addStringOption(option =>
            option
                .setName('arama')
                .setDescription('Aranacak terim')
                .setRequired(true)),

    async execute(interaction) {
        const search = interaction.options.getString('arama');
        const url = `https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(search)}`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setDescription(data.extract)
                .setURL(data.content_urls.desktop.page)
                .setColor('#0099ff')
                .setTimestamp();

            if (data.thumbnail) {
                embed.setThumbnail(data.thumbnail.source);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Arama sonucu bulunamadı.',
                ephemeral: true
            });
        }
    }
}; 