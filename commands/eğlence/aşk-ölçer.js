const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

// Özel kullanıcı ID'leri
const specialPair = {
    user1: '1130240996089802844', // İlk kullanıcı ID'si
    user2: '1329897099256664216'  // İkinci kullanıcı ID'si
};

// Renk ve stil sabitleri
const BRAND_COLOR = '#FF69B4';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aşk-ölçer')
        .setDescription('İki kullanıcı arasındaki aşk uyumunu ölçer 💘'),

    async execute(interaction) {
        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`love_select_${interaction.user.id}`)
                    .setPlaceholder('💝 Kiminle ölçmek istersin?')
                    .addOptions([
                        {
                            label: '💘 Belirli bir kullanıcı',
                            description: 'Seçtiğin bir kullanıcı ile aşk uyumunu ölç',
                            value: 'specific_user',
                            emoji: '❤️'
                        },
                        {
                            label: '🎲 Rastgele bir kullanıcı',
                            description: 'Sunucudan rastgele biriyle aşk uyumunu ölç',
                            value: 'random_user',
                            emoji: '🎯'
                        }
                    ])
            );

        const initialEmbed = new EmbedBuilder()
            .setTitle('💖 Aşk Ölçer')
            .setDescription('```diff\n+ Aşkını ölçmek istediğin kişiyi seç!\n- Seçtiğin kişiyle aranızdaki uyumu hesaplayacağım\n```')
            .setColor(BRAND_COLOR)
            .setThumbnail('https://i.imgur.com/6vYlJai.png')
            .addFields(
                { 
                    name: '❓ Nasıl Kullanılır?', 
                    value: '> Aşağıdaki menüden bir seçenek seç ve sonucu gör!' 
                },
                { 
                    name: '📝 Not', 
                    value: '> Aşk ölçer sonuçları tamamen rastgeledir ve eğlence amaçlıdır.' 
                }
            )
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        await interaction.reply({
            embeds: [initialEmbed],
            components: [menu]
        });
    }
};

function createProgressBar(percent) {
    const filledChar = '█';
    const emptyChar = '░';
    const barLength = 15;
    const filledLength = Math.round((percent / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    const bar = filledChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
    const hearts = percent >= 80 ? '💝' : percent >= 60 ? '💖' : percent >= 40 ? '💗' : percent >= 20 ? '💓' : '💔';
    
    return `${hearts} ${bar} ${hearts}`;
}