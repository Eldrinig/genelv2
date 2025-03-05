const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FFD700';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

// Sonuç emojileri ve resimleri
const RESULT_IMAGES = {
    yazı: 'https://i.imgur.com/8CXQYVe.png', // Yazı resmi
    tura: 'https://i.imgur.com/RQfQZZG.png'  // Tura resmi
};

const RESULT_EMOJIS = {
    yazı: '📜',
    tura: '🌟'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yazı-tura')
        .setDescription('🎯 Şansını dene, yazı tura at!'),

    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'yazı' : 'tura';
        const winStreak = Math.floor(Math.random() * 5) + 1; // 1-5 arası rastgele şans serisi

        const embed = new EmbedBuilder()
            .setTitle(`${RESULT_EMOJIS[result]} Yazı Tura Sonucu`)
            .setDescription(`
\`\`\`diff
+ ${interaction.user.username} para attı!
- Ve sonuç...\`\`\`

**${result.toUpperCase()}** ${RESULT_EMOJIS[result]}

${getFlavorText(result, winStreak)}`)
            .setColor(BRAND_COLOR)
            .setThumbnail(RESULT_IMAGES[result])
            .addFields(
                { 
                    name: '🎯 Sonuç', 
                    value: `> **${result.toUpperCase()}** geldi!`, 
                    inline: true 
                },
                { 
                    name: '🍀 Şans Serisi', 
                    value: `> **${winStreak}x** şans çarpanı!`, 
                    inline: true 
                }
            )
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

function getFlavorText(result, streak) {
    const messages = {
        yazı: [
            '📜 Yazı geldi! Klasik bir seçim!',
            '📜 Yazı! Bazen en basit sonuç en iyisidir!',
            '📜 Yazı çıktı! Şans bu sefer bu yönde!',
            '📜 Ve yazı! Kaderin tercihi bu yönde!'
        ],
        tura: [
            '🌟 Tura parladı! Şanslı bir an!',
            '🌟 Tura! Parlak bir sonuç!',
            '🌟 Tura çıktı! Yıldızlar senin yanında!',
            '🌟 Ve tura! Şans meleği seninle!'
        ]
    };

    const message = messages[result][Math.floor(Math.random() * messages[result].length)];
    const streakMessage = streak > 3 ? '\n\n🔥 **MUHTEŞEM BİR ŞANS SERİSİ!**' : 
                         streak > 2 ? '\n\n✨ **Güzel bir şans serisi!**' : 
                         streak > 1 ? '\n\n⭐ **İyi gidiyorsun!**' : '';

    return `${message}${streakMessage}`;
} 