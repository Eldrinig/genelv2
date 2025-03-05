const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const translate = require('@vitalets/google-translate-api');
const { translateApiKey } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('çeviri')
        .setDescription('Metni başka bir dile çevirir')
        .addStringOption(option =>
            option
                .setName('metin')
                .setDescription('Çevrilecek metin')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('dil')
                .setDescription('Hedef dil')
                .setRequired(true)
                .addChoices(
                    { name: 'İngilizce', value: 'en' },
                    { name: 'Türkçe', value: 'tr' },
                    { name: 'Almanca', value: 'de' },
                    { name: 'Fransızca', value: 'fr' },
                    { name: 'İspanyolca', value: 'es' },
                    { name: 'İtalyanca', value: 'it' },
                    { name: 'Rusça', value: 'ru' },
                    { name: 'Arapça', value: 'ar' },
                    { name: 'Japonca', value: 'ja' },
                    { name: 'Korece', value: 'ko' }
                )),

    async execute(interaction) {
        await interaction.deferReply();

        const text = interaction.options.getString('metin');
        const targetLang = interaction.options.getString('dil');

        try {
            const result = await translate(text, { 
                to: targetLang,
                key: translateApiKey 
            });

            const embed = new EmbedBuilder()
                .setTitle('🌐 Çeviri')
                .addFields(
                    { name: 'Orijinal Metin', value: text },
                    { name: 'Çeviri', value: result.text }
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: 'Çeviri yapılırken bir hata oluştu.',
                ephemeral: true
            });
        }
    }
}; 