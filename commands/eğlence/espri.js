const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FFA500';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

// Espri kategorileri ve emojileri
const JOKE_CATEGORIES = {
    WORDPLAY: { emoji: '🎯', name: 'Kelime Oyunu' },
    SITUATIONAL: { emoji: '🎭', name: 'Durumsal' },
    PUN: { emoji: '🎪', name: 'Cinas' }
};

const jokes = [
    {
        text: "Seni görünce gözlerim dolar, kurum da euro.",
        category: 'WORDPLAY',
        rating: 4
    },
    {
        text: "Yılanlardan korkma, yılmayanlardan kork.",
        category: 'WORDPLAY',
        rating: 3
    },
    {
        text: "Kar üzerinde yürüyen adama ne denir? Karabasan.",
        category: 'PUN',
        rating: 4
    },
    {
        text: "Yağmur yağmış, kar peşinden gidiyormuş. Neden? Çünkü yağmur yağmış.",
        category: 'SITUATIONAL',
        rating: 3
    },
    {
        text: "Adamın biri güneşte yanmış, ay da düz.",
        category: 'SITUATIONAL',
        rating: 3
    },
    {
        text: "Ben hikaye yazarım Ebru Destan.",
        category: 'PUN',
        rating: 4
    },
    {
        text: "Sinemada on dakika ara dedi, aradım aradım açmadı.",
        category: 'WORDPLAY',
        rating: 5
    },
    {
        text: "Yıkanan Ton'a ne denir? Washington.",
        category: 'PUN',
        rating: 4
    },
    {
        text: "İshal olmuş böceğe ne denir? Cırcır böceği.",
        category: 'PUN',
        rating: 3
    },
    {
        text: "Hamburgerci John'a ne denir? Etli John.",
        category: 'PUN',
        rating: 3
    },
    {
        text: "Türk askeri ne demiş? Vur Mehmet vur.",
        category: 'SITUATIONAL',
        rating: 3
    },
    {
        text: "Adamın biri kızmış, diğeri erkek.",
        category: 'WORDPLAY',
        rating: 4
    },
    {
        text: "Rock yapmayan kıza ne denir? Yaprock.",
        category: 'PUN',
        rating: 4
    },
    {
        text: "Ben ekmek yiyorum, sen ayın kaçı?",
        category: 'WORDPLAY',
        rating: 3
    },
    {
        text: "Adamın biri gülmüş, bahçeye dikmişler.",
        category: 'WORDPLAY',
        rating: 4
    },
    {
        text: "Adamın kafası atmış, bacakları eşek.",
        category: 'SITUATIONAL',
        rating: 3
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('espri')
        .setDescription('😄 Rastgele bir espri yapar, gülmek garanti değildir!'),

    async execute(interaction) {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        const category = JOKE_CATEGORIES[randomJoke.category];
        const ratingStars = '⭐'.repeat(randomJoke.rating);

        const embed = new EmbedBuilder()
            .setTitle(`${category.emoji} Espri Zamanı!`)
            .setDescription(`
\`\`\`diff
+ ${interaction.user.username} bir espri patlatıyor!
- Hazır mısınız?\`\`\`

**${randomJoke.text}** ${getRandomLaughEmoji()}

${getJokeReaction(randomJoke.rating)}`)
            .setColor(BRAND_COLOR)
            .setThumbnail('https://i.imgur.com/wz3RCNu.png')
            .addFields(
                { 
                    name: '📝 Kategori', 
                    value: `> ${category.emoji} ${category.name}`, 
                    inline: true 
                },
                { 
                    name: '⭐ Komiklik Seviyesi', 
                    value: `> ${ratingStars}`, 
                    inline: true 
                }
            )
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};

function getRandomLaughEmoji() {
    const laughEmojis = ['😄', '😂', '🤣', '😆', '😅', '😹'];
    return laughEmojis[Math.floor(Math.random() * laughEmojis.length)];
}

function getJokeReaction(rating) {
    if (rating >= 5) return '🔥 **Bu espri çok iyiydi!**';
    if (rating >= 4) return '😄 **Güzel espri!**';
    if (rating >= 3) return '😅 **Fena değil!**';
    return '😬 **En azından denedik!**';
} 