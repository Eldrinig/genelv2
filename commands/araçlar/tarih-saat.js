const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tarih-saat')
        .setDescription('Farklı zaman dilimlerindeki saatleri gösterir')
        .addStringOption(option =>
            option
                .setName('şehir')
                .setDescription('Şehir veya zaman dilimi')
                .setRequired(false)
                .addChoices(
                    { name: 'İstanbul', value: 'Europe/Istanbul' },
                    { name: 'Londra', value: 'Europe/London' },
                    { name: 'New York', value: 'America/New_York' },
                    { name: 'Tokyo', value: 'Asia/Tokyo' },
                    { name: 'Sydney', value: 'Australia/Sydney' }
                )),

    async execute(interaction) {
        const timezone = interaction.options.getString('şehir') || 'Europe/Istanbul';
        const now = moment().tz(timezone);

        const embed = new EmbedBuilder()
            .setTitle('🕒 Tarih ve Saat')
            .addFields(
                { name: 'İstanbul', value: moment().tz('Europe/Istanbul').format('DD/MM/YYYY HH:mm'), inline: true },
                { name: 'Londra', value: moment().tz('Europe/London').format('DD/MM/YYYY HH:mm'), inline: true },
                { name: 'New York', value: moment().tz('America/New_York').format('DD/MM/YYYY HH:mm'), inline: true },
                { name: 'Tokyo', value: moment().tz('Asia/Tokyo').format('DD/MM/YYYY HH:mm'), inline: true },
                { name: 'Sydney', value: moment().tz('Australia/Sydney').format('DD/MM/YYYY HH:mm'), inline: true }
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 