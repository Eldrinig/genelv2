const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FFD700';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

// Hazine tipleri ve özellikleri
const TREASURE_TYPES = {
    COMMON: {
        emoji: '📦',
        name: 'Sıradan Hazine',
        color: '#A0522D',
        minGold: 100,
        maxGold: 500,
        chance: 50
    },
    RARE: {
        emoji: '🎁',
        name: 'Nadir Hazine',
        color: '#4169E1',
        minGold: 500,
        maxGold: 2000,
        chance: 30
    },
    EPIC: {
        emoji: '💎',
        name: 'Destansı Hazine',
        color: '#9932CC',
        minGold: 2000,
        maxGold: 5000,
        chance: 15
    },
    LEGENDARY: {
        emoji: '👑',
        name: 'Efsanevi Hazine',
        color: '#FFD700',
        minGold: 5000,
        maxGold: 10000,
        chance: 5
    }
};

// Bölge tipleri
const REGIONS = {
    FOREST: {
        emoji: '🌲',
        name: 'Gizemli Orman',
        description: 'Ağaçların arasında gizlenmiş hazineler...',
        dangerLevel: 1
    },
    CAVE: {
        emoji: '⛰️',
        name: 'Karanlık Mağara',
        description: 'Derinlerde saklı zenginlikler...',
        dangerLevel: 2
    },
    RUINS: {
        emoji: '🏛️',
        name: 'Antik Harabeler',
        description: 'Eski uygarlıklardan kalma hazineler...',
        dangerLevel: 3
    },
    VOLCANO: {
        emoji: '🌋',
        name: 'Yanardağ',
        description: 'Tehlikeli ama değerli hazineler...',
        dangerLevel: 4
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hazine-avı')
        .setDescription('🗺️ Hazine avına çık ve zenginlikleri keşfet!')
        .addStringOption(option =>
            option
                .setName('bölge')
                .setDescription('Hazine arayacağın bölgeyi seç')
                .setRequired(true)
                .addChoices(
                    { name: '🌲 Gizemli Orman', value: 'FOREST' },
                    { name: '⛰️ Karanlık Mağara', value: 'CAVE' },
                    { name: '🏛️ Antik Harabeler', value: 'RUINS' },
                    { name: '🌋 Yanardağ', value: 'VOLCANO' }
                )),

    async execute(interaction) {
        const selectedRegion = interaction.options.getString('bölge');
        const region = REGIONS[selectedRegion];

        // Kullanıcının hazine avı durumunu kontrol et
        const userCooldown = interaction.client.treasureHunts.get(interaction.user.id);
        if (userCooldown && Date.now() < userCooldown) {
            const remainingTime = Math.ceil((userCooldown - Date.now()) / 1000);
            const cooldownEmbed = new EmbedBuilder()
                .setTitle('⏳ Dinlenme Zamanı')
                .setDescription(`
\`\`\`diff
- Henüz yeni bir maceraya çıkamazsın
+ Biraz dinlenmen gerekiyor\`\`\`

**Kalan Süre**
> ⏰ ${Math.floor(remainingTime / 60)} dakika ${remainingTime % 60} saniye

*Bir sonraki hazine avı için dinlenmen gerekiyor...*`)
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }

        // Hazine avı başlangıç mesajı
        const startEmbed = new EmbedBuilder()
            .setTitle(`${region.emoji} Hazine Avı Başlıyor!`)
            .setDescription(`
\`\`\`diff
+ ${interaction.user.username} hazine avına çıkıyor!
- ${region.name}'a doğru yola çıktın\`\`\`

**Bölge Bilgileri**
> ${region.emoji} **${region.name}**
> 📝 ${region.description}
> ⚠️ Tehlike Seviyesi: ${'⚔️'.repeat(region.dangerLevel)}

*İpucu: Tehlike seviyesi yüksek bölgelerde daha değerli hazineler bulunur!*`)
            .setColor(BRAND_COLOR)
            .setThumbnail('https://i.imgur.com/wz3RCNu.png')
            .addFields(
                { 
                    name: '🎯 Hedef', 
                    value: '> Bölgede gizlenmiş hazineleri bul!', 
                    inline: true 
                },
                { 
                    name: '⚠️ Risk', 
                    value: `> Tehlike Seviyesi: ${region.dangerLevel}/4`, 
                    inline: true 
                }
            )
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`treasure_search_${selectedRegion}`)
                    .setLabel('Hazine Ara')
                    .setEmoji('🔍')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`treasure_map_${selectedRegion}`)
                    .setLabel('Haritayı İncele')
                    .setEmoji('🗺️')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.reply({
            embeds: [startEmbed],
            components: [buttons]
        });
    }
}; 