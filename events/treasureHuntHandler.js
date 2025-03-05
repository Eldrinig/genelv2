const { Events, EmbedBuilder } = require('discord.js');

// Hazine tipleri ve özellikleri (ana dosyadan alındı)
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

// Bölge tipleri (ana dosyadan alındı)
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

// Rastgele hazine seçme fonksiyonu
function selectRandomTreasure(dangerLevel) {
    const random = Math.random() * 100;
    let chanceSum = 0;
    
    // Tehlike seviyesine göre şansları artır
    const bonusChance = (dangerLevel - 1) * 5;
    
    for (const [type, treasure] of Object.entries(TREASURE_TYPES)) {
        const adjustedChance = type === 'LEGENDARY' ? treasure.chance + bonusChance : treasure.chance;
        chanceSum += adjustedChance;
        
        if (random <= chanceSum) {
            return {
                type,
                ...treasure,
                gold: Math.floor(Math.random() * (treasure.maxGold - treasure.minGold + 1)) + treasure.minGold
            };
        }
    }
    
    return {
        type: 'COMMON',
        ...TREASURE_TYPES.COMMON,
        gold: Math.floor(Math.random() * (TREASURE_TYPES.COMMON.maxGold - TREASURE_TYPES.COMMON.minGold + 1)) + TREASURE_TYPES.COMMON.minGold
    };
}

// Macera olayları
const ADVENTURE_EVENTS = [
    {
        type: 'POSITIVE',
        description: 'Eski bir harita buldun! 🗺️',
        effect: 'Hazine bulma şansın arttı!'
    },
    {
        type: 'NEGATIVE',
        description: 'Bir tuzağa yakalandın! ⚠️',
        effect: 'Biraz hasar aldın...'
    },
    {
        type: 'NEUTRAL',
        description: 'Gizemli bir iz buldun! 👣',
        effect: 'Acaba nereye gidiyor?'
    },
    // Daha fazla olay eklenebilir
];

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const [action, region] = interaction.customId.split('_').slice(1);
        if (!action || !region) return;

        if (action === 'search') {
            // Hazine arama işlemi
            const selectedRegion = REGIONS[region];
            const foundTreasure = selectRandomTreasure(selectedRegion.dangerLevel);
            
            // Rastgele bir macera olayı seç
            const randomEvent = ADVENTURE_EVENTS[Math.floor(Math.random() * ADVENTURE_EVENTS.length)];

            const resultEmbed = new EmbedBuilder()
                .setTitle(`${foundTreasure.emoji} Hazine Bulundu!`)
                .setDescription(`
\`\`\`diff
+ Maceran başarıyla sonuçlandı!
- ${randomEvent.description}\`\`\`

**Hazine Bilgileri**
> ${foundTreasure.emoji} **${foundTreasure.name}**
> 💰 ${foundTreasure.gold} Altın değerinde!

**Macera Detayları**
> ${selectedRegion.emoji} Bölge: ${selectedRegion.name}
> 📝 ${randomEvent.effect}

*Tebrikler! Başarılı bir hazine avı gerçekleştirdin!*`)
                .setColor(foundTreasure.color)
                .setThumbnail('https://i.imgur.com/wz3RCNu.png')
                .setFooter({ text: 'ZoweCeldrin', iconURL: 'https://i.imgur.com/XwVQxA5.png' })
                .setTimestamp();

            // Cooldown ayarla (30 dakika)
            interaction.client.treasureHunts.set(interaction.user.id, Date.now() + 1800000);

            await interaction.reply({ embeds: [resultEmbed], ephemeral: true });
        } else if (action === 'map') {
            // Harita inceleme işlemi
            const selectedRegion = REGIONS[region];
            
            const mapEmbed = new EmbedBuilder()
                .setTitle(`${selectedRegion.emoji} Bölge Haritası`)
                .setDescription(`
\`\`\`diff
+ ${selectedRegion.name} bölgesinin haritası
- Dikkatli incele, ipuçları bulabilirsin!\`\`\`

**Bölge Detayları**
> ${selectedRegion.emoji} **${selectedRegion.name}**
> 📝 ${selectedRegion.description}
> ⚠️ Tehlike Seviyesi: ${'⚔️'.repeat(selectedRegion.dangerLevel)}

**Hazine Tipleri ve Şansları**
${Object.entries(TREASURE_TYPES).map(([_, treasure]) => 
    `> ${treasure.emoji} **${treasure.name}**\n> 💰 ${treasure.minGold}-${treasure.maxGold} Altın\n> 🎲 Bulma Şansı: %${treasure.chance}`
).join('\n\n')}

*İpucu: Tehlike seviyesi yüksek bölgelerde daha değerli hazineler bulunur!*`)
                .setColor('#FFD700')
                .setThumbnail('https://i.imgur.com/wz3RCNu.png')
                .setFooter({ text: 'ZoweCeldrin', iconURL: 'https://i.imgur.com/XwVQxA5.png' })
                .setTimestamp();

            await interaction.reply({ embeds: [mapEmbed], ephemeral: true });
        }
    }
}; 