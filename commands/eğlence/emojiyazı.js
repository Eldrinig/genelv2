const { SlashCommandBuilder } = require('discord.js');

const emojiMap = {
    'a': '🅰️', 'b': '🅱️', 'c': '©️', 'd': '🇩', 'e': '📧', 'f': '🎏',
    'g': '🇬', 'h': '♓', 'i': 'ℹ️', 'j': '🗾', 'k': '🎋', 'l': '🇱',
    'm': 'Ⓜ️', 'n': '🇳', 'o': '⭕', 'p': '🅿️', 'q': '🔍', 'r': '®️',
    's': '💲', 't': '✝️', 'u': '⛎', 'v': '♈', 'w': '〰️', 'x': '❌',
    'y': '💴', 'z': '💤', ' ': '  ', '?': '❓', '!': '❗', '.': '⏺️'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojiyazı')
        .setDescription('Metni emoji harflere çevirir')
        .addStringOption(option =>
            option
                .setName('metin')
                .setDescription('Emoji harflere çevrilecek metin')
                .setRequired(true)
                .setMaxLength(50)),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const text = interaction.options.getString('metin').toLowerCase();
            let emojiText = '';

            for (const char of text) {
                emojiText += emojiMap[char] || char;
                emojiText += ' ';
            }

            await interaction.editReply(emojiText);
        } catch (error) {
            console.error('Emoji yazı komutu hatası:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: 'Emoji yazı oluşturulurken bir hata oluştu!',
                    ephemeral: true 
                });
            } else {
                await interaction.editReply({ 
                    content: 'Emoji yazı oluşturulurken bir hata oluştu!',
                    ephemeral: true 
                });
            }
        }
    }
}; 