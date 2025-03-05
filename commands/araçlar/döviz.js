const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { exchangeApiKey } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('döviz')
        .setDescription('Güncel döviz kurlarını gösterir')
        .addStringOption(option =>
            option
                .setName('birim')
                .setDescription('Döviz birimi')
                .setRequired(true)
                .addChoices(
                    { name: 'USD - Amerikan Doları', value: 'USD' },
                    { name: 'EUR - Euro', value: 'EUR' },
                    { name: 'GBP - İngiliz Sterlini', value: 'GBP' },
                    { name: 'JPY - Japon Yeni', value: 'JPY' },
                    { name: 'CHF - İsviçre Frangı', value: 'CHF' },
                    { name: 'AUD - Avustralya Doları', value: 'AUD' },
                    { name: 'CAD - Kanada Doları', value: 'CAD' }
                )),

    async execute(interaction) {
        const currency = interaction.options.getString('birim');
        const url = `https://api.exchangerate-api.com/v4/latest/${currency}?access_key=${exchangeApiKey}`;

        try {
            const response = await axios.get(url);
            const rates = response.data.rates;

            const embed = new EmbedBuilder()
                .setTitle(`💱 ${currency} Döviz Kuru`)
                .addFields(
                    { name: 'TRY - Türk Lirası', value: rates.TRY.toFixed(2), inline: true },
                    { name: 'USD - Amerikan Doları', value: rates.USD.toFixed(2), inline: true },
                    { name: 'EUR - Euro', value: rates.EUR.toFixed(2), inline: true },
                    { name: 'GBP - İngiliz Sterlini', value: rates.GBP.toFixed(2), inline: true }
                )
                .setColor('#ffd700')
                .setFooter({ text: 'Veriler anlık olarak güncellenmektedir' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Döviz kurları alınamadı.',
                ephemeral: true
            });
        }
    }
}; 