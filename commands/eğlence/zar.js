const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#4169E1';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

// Zar emojileri
const DICE_EMOJIS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zar')
        .setDescription('🎲 Şansını dene, zar at!')
        .addIntegerOption(option =>
            option
                .setName('adet')
                .setDescription('Kaç zar atmak istersin? (1-6)')
                .setMinValue(1)
                .setMaxValue(6)
                .setRequired(false)),

    async execute(interaction) {
        const count = interaction.options.getInteger('adet') || 1;
        const results = [];
        let total = 0;

        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * 6) + 1;
            results.push(roll);
            total += roll;
        }

        const diceResults = results.map((r, i) => {
            const emoji = DICE_EMOJIS[r - 1];
            return `${i + 1}. Zar: ${emoji} (${r})`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🎲 Zar Atma Sonucu')
            .setDescription(`
\`\`\`diff
+ ${interaction.user.username} ${count} zar attı!
- Bakalım şansı yaver gitti mi?\`\`\`

${diceResults}

**Toplam:** ${total} ${getResultEmoji(total, count)}`)
            .setColor(BRAND_COLOR)
            .setThumbnail('https://i.imgur.com/dQw9wsh.png')
            .addFields(
                { 
                    name: '📊 İstatistik', 
                    value: `> Ortalama: **${(total / count).toFixed(2)}**\n> En Yüksek: **${Math.max(...results)}**\n> En Düşük: **${Math.min(...results)}**`, 
                    inline: true 
                },
                { 
                    name: '💫 Şans Faktörü', 
                    value: `> ${getResultMessage(total, count)}`, 
                    inline: true 
                }
            )
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

function getResultEmoji(total, count) {
    const average = total / count;
    if (average >= 5) return '🌟';
    if (average >= 4) return '✨';
    if (average >= 3) return '⭐';
    return '💫';
}

function getResultMessage(total, count) {
    const average = total / count;
    if (average >= 5) return 'Muhteşem bir atış!';
    if (average >= 4) return 'Çok iyi bir sonuç!';
    if (average >= 3) return 'Fena değil!';
    return 'Bir dahaki sefere!';
} 