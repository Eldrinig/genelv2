const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { weatherApiKey } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hava-durumu')
        .setDescription('Belirtilen şehrin hava durumunu gösterir')
        .addStringOption(option =>
            option
                .setName('şehir')
                .setDescription('Hava durumu gösterilecek şehir')
                .setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('şehir');
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric&lang=tr`;

        try {
            const response = await axios.get(url);
            const weather = response.data;

            const embed = new EmbedBuilder()
                .setTitle(`🌤️ ${weather.name} Hava Durumu`)
                .addFields(
                    { name: 'Sıcaklık', value: `${Math.round(weather.main.temp)}°C`, inline: true },
                    { name: 'Hissedilen', value: `${Math.round(weather.main.feels_like)}°C`, inline: true },
                    { name: 'Nem', value: `${weather.main.humidity}%`, inline: true },
                    { name: 'Durum', value: weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1) }
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Hava durumu bilgisi alınamadı. Lütfen geçerli bir şehir adı girin.',
                ephemeral: true
            });
        }
    }
}; 