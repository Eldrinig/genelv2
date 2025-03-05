const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#00FF00';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/nXqD6aG.png';

// Kategori emojileri ve açıklamaları
const CATEGORIES = {
    moderasyon: {
        emoji: '🛡️',
        name: 'Moderasyon',
        description: 'Sunucu yönetimi ve düzeni için gerekli komutlar',
        color: '#FF0000',
        commands: [
            {
                name: 'ban',
                description: '🔨 Üyeyi sunucudan yasaklar',
                usage: '/ban <kullanıcı> [sebep] [sessiz]',
                details: [
                    '• Kullanıcı: Yasaklanacak üye (gerekli)',
                    '• Sebep: Yasaklama sebebi (isteğe bağlı)',
                    '• Sessiz: Yasaklama işlemini gizli tutar (isteğe bağlı)',
                    '⚠️ Yetki gerektirir: Üyeleri Yasakla'
                ]
            },
            {
                name: 'kick',
                description: '👢 Üyeyi sunucudan atar',
                usage: '/kick <kullanıcı> [sebep] [sessiz]',
                details: [
                    '• Kullanıcı: Atılacak üye (gerekli)',
                    '• Sebep: Atılma sebebi (isteğe bağlı)',
                    '• Sessiz: Atma işlemini gizli tutar (isteğe bağlı)',
                    '⚠️ Yetki gerektirir: Üyeleri At'
                ]
            },
            {
                name: 'mute',
                description: '🔇 Üyeyi susturur',
                usage: '/mute <kullanıcı> <süre> [sebep] [sessiz]',
                details: [
                    '• Kullanıcı: Susturulacak üye (gerekli)',
                    '• Süre: Susturma süresi (1m, 1h, 1d) (gerekli)',
                    '• Sebep: Susturma sebebi (isteğe bağlı)',
                    '• Sessiz: Susturma işlemini gizli tutar (isteğe bağlı)',
                    '⚠️ Yetki gerektirir: Üyeleri Yönet'
                ]
            },
            {
                name: 'unmute',
                description: '�� Üyenin susturmasını kaldırır',
                usage: '/unmute <kullanıcı> [sessiz]',
                details: [
                    '• Kullanıcı: Susturması kaldırılacak üye (gerekli)',
                    '• Sessiz: İşlemi gizli tutar (isteğe bağlı)',
                    '⚠️ Yetki gerektirir: Üyeleri Yönet'
                ]
            }
        ]
    },
    eğlence: {
        emoji: '🎮',
        name: 'Eğlence',
        description: 'Eğlenceli ve keyifli vakit geçirmenizi sağlayan komutlar',
        color: '#FF69B4',
        commands: [
            {
                name: 'hazine-avı',
                description: '🗺️ Hazine avına çık ve zenginlikleri keşfet',
                usage: '/hazine-avı <bölge>',
                details: [
                    '• Bölge: Hazine arayacağın bölge (gerekli)',
                    '🌲 Gizemli Orman (Tehlike: ⚔️)',
                    '⛰️ Karanlık Mağara (Tehlike: ⚔️⚔️)',
                    '🏛️ Antik Harabeler (Tehlike: ⚔️⚔️⚔️)',
                    '🌋 Yanardağ (Tehlike: ⚔️⚔️⚔️⚔️)',
                    '⏳ Bekleme Süresi: 30 dakika'
                ]
            },
            {
                name: 'zar',
                description: '🎲 Şansını dene, zar at',
                usage: '/zar [adet]',
                details: [
                    '• Adet: Kaç zar atmak istediğin (1-6)',
                    '• Varsayılan: 1 zar',
                    '📊 Detaylı istatistikler gösterilir'
                ]
            },
            {
                name: 'yazı-tura',
                description: '🎯 Yazı tura at',
                usage: '/yazı-tura',
                details: [
                    '📜 Yazı veya 🌟 Tura',
                    '🎯 Şans serisi sistemi',
                    '🎨 Görsel sonuç gösterimi'
                ]
            },
            {
                name: 'aşk-ölçer',
                description: '💘 İki kullanıcı arasındaki aşk uyumunu ölç',
                usage: '/aşk-ölçer',
                details: [
                    '💝 Özel seçim menüsü',
                    '❤️ Detaylı uyum analizi',
                    '📊 Görsel uyum gösterimi',
                    '🎯 Şans faktörü sistemi'
                ]
            },
            {
                name: 'rus-ruleti',
                description: '🔫 Rus ruleti oynar',
                usage: '/rus-ruleti <alt-komut>',
                details: [
                    '• başlat: Yeni oyun başlatır',
                    '• ateş: Tetiği çeker',
                    '🎯 Şans faktörü sistemi',
                    '📊 Detaylı sonuç gösterimi'
                ]
            },
            {
                name: 'kelime-oyunu',
                description: '📝 Kelime tahmin oyunu',
                usage: '/kelime-oyunu <alt-komut>',
                details: [
                    '• başlat: Yeni oyun başlatır',
                    '• tahmin: Tahminde bulun',
                    '📊 Puan sistemi',
                    '🎨 Görsel arayüz'
                ]
            },
            {
                name: 'taş-kağıt-makas',
                description: '✂️ Taş kağıt makas oynar',
                usage: '/taş-kağıt-makas <seçim>',
                details: [
                    '• seçim: Taş, kağıt veya makas',
                    '🎯 Şans faktörü sistemi',
                    '🎨 Görsel sonuç gösterimi'
                ]
            },
            {
                name: 'tersyazı',
                description: '🔄 Metni ters çevirir',
                usage: '/tersyazı <metin>',
                details: [
                    '• metin: Ters çevrilecek metin',
                    '�� Özel formatlı çıktı'
                ]
            },
            {
                name: 'emojiyazı',
                description: '😄 Metni emoji harflere çevirir',
                usage: '/emojiyazı <metin>',
                details: [
                    '• metin: Emoji harflere çevrilecek metin',
                    '🎨 Özel emoji formatı',
                    '📝 50 karakter limiti'
                ]
            }
        ]
    },
    araçlar: {
        emoji: '🔧',
        name: 'Araçlar',
        description: 'Çeşitli yardımcı araç ve özellikler',
        color: '#4169E1',
        commands: [
            {
                name: 'yardım',
                description: '❓ Komutlar hakkında bilgi verir',
                usage: '/yardım',
                details: [
                    '📚 Kategorilere ayrılmış komut listesi',
                    '🔍 Detaylı komut açıklamaları',
                    '�� Kullanım örnekleri ve ipuçları',
                    '🎨 Renkli ve görsel arayüz'
                ]
            },
            {
                name: 'çeviri',
                description: '🌐 Metni başka bir dile çevirir',
                usage: '/çeviri <metin> <dil>',
                details: [
                    '• metin: Çevrilecek metin',
                    '• dil: Hedef dil',
                    '📚 10 farklı dil desteği',
                    '🎨 Görsel sonuç gösterimi'
                ]
            },
            {
                name: 'hesapla',
                description: '🔢 Matematiksel işlem yapar',
                usage: '/hesapla <işlem>',
                details: [
                    '• işlem: Yapılacak matematiksel işlem',
                    '📊 Detaylı sonuç gösterimi',
                    '🎯 Hata kontrolü'
                ]
            },
            {
                name: 'wikipedia',
                description: '📚 Wikipedia\'da arama yapar',
                usage: '/wikipedia <arama>',
                details: [
                    '• arama: Aranacak terim',
                    '🔍 Detaylı sonuç gösterimi',
                    '🖼️ Varsa görsel içerik'
                ]
            },
            {
                name: 'not',
                description: '�� Not alma sistemi',
                usage: '/not <alt-komut>',
                details: [
                    '• ekle: Yeni not ekler',
                    '• listele: Notları listeler',
                    '• sil: Not siler',
                    '📊 Organize not sistemi'
                ]
            },
            {
                name: 'tarih-saat',
                description: '�� Farklı zaman dilimlerindeki saatleri gösterir',
                usage: '/tarih-saat [şehir]',
                details: [
                    '• şehir: Şehir veya zaman dilimi (isteğe bağlı)',
                    '🌍 5 farklı zaman dilimi',
                    '📊 Detaylı saat gösterimi'
                ]
            }
        ]
    }
};

// Her sayfada gösterilecek komut sayısı
const COMMANDS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('🤖 Bot komutları hakkında detaylı bilgi verir'),

    async execute(interaction) {
        try {
            const menu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('help_menu')
                        .setPlaceholder('📚 Hangi kategori hakkında bilgi almak istersin?')
                        .addOptions(
                            Object.entries(CATEGORIES).map(([value, category]) => ({
                                label: category.name,
                                description: category.description,
                                value: value,
                                emoji: category.emoji
                            }))
                        )
                );

            const initialEmbed = new EmbedBuilder()
                .setTitle('🤖 Komut Merkezi')
                .setDescription(`
\`\`\`diff
+ Bot Komutları ve Özellikleri
- Detaylı bilgi için kategori seçin\`\`\`

**Kategoriler**
${Object.entries(CATEGORIES).map(([_, category]) => 
    `> ${category.emoji} **${category.name}**\n> ${category.description}`
).join('\n\n')}

*Bir kategori seçerek detaylı bilgi alabilirsiniz.*`)
                .setColor(BRAND_COLOR)
                .setThumbnail('https://i.imgur.com/nXqD6aG.png')
                .addFields(
                    { 
                        name: '📌 Nasıl Kullanılır?', 
                        value: '> Aşağıdaki menüden bir kategori seçin\n> Seçtiğiniz kategorideki komutları görüntüleyin', 
                        inline: false 
                    },
                    { 
                        name: '❓ Yardım mı lazım?', 
                        value: '> Bir sorun yaşarsanız sunucu yetkilileriyle iletişime geçin', 
                        inline: false 
                    }
                )
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            const message = await interaction.reply({
                embeds: [initialEmbed],
                components: [menu],
                fetchReply: true
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 300000 });

            collector.on('collect', async (i) => {
                try {
                    if (i.isStringSelectMenu()) {
                        const categoryId = i.values[0];
                        const category = CATEGORIES[categoryId];
                        let currentPage = 0;
                        const totalPages = Math.ceil(category.commands.length / COMMANDS_PER_PAGE);

                        const generateEmbed = (pageIndex) => {
                            const start = pageIndex * COMMANDS_PER_PAGE;
                            const end = start + COMMANDS_PER_PAGE;
                            const pageCommands = category.commands.slice(start, end);

                            return new EmbedBuilder()
                                .setTitle(`${category.emoji} ${category.name} Komutları`)
                                .setDescription(`
\`\`\`diff
+ ${category.description}
- Kullanılabilir komutlar aşağıda listelenmiştir\`\`\`

${pageCommands.map(cmd => `**${cmd.name}**
> ${cmd.description}
> 📝 Kullanım: \`${cmd.usage}\`
${cmd.details.map(detail => `> ${detail}`).join('\n')}
`).join('\n')}

*Sayfa ${pageIndex + 1}/${totalPages}*`)
                                .setColor(category.color)
                                .setThumbnail('https://i.imgur.com/nXqD6aG.png')
                                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                                .setTimestamp();
                        };

                        const generateButtons = (pageIndex) => {
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`prev_${pageIndex}`)
                                        .setLabel('◀️ Önceki Sayfa')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(pageIndex === 0),
                                    new ButtonBuilder()
                                        .setCustomId(`next_${pageIndex}`)
                                        .setLabel('Sonraki Sayfa ▶️')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(pageIndex === totalPages - 1)
                                );
                            return row;
                        };

                        const components = [menu];
                        if (totalPages > 1) {
                            components.push(generateButtons(currentPage));
                        }

                        await i.update({
                            embeds: [generateEmbed(currentPage)],
                            components: components
                        });
                    } else if (i.isButton()) {
                        const currentPage = parseInt(i.customId.split('_')[1]);
                        const categoryId = i.values?.[0] || Object.keys(CATEGORIES)[0];
                        const category = CATEGORIES[categoryId];
                        const totalPages = Math.ceil(category.commands.length / COMMANDS_PER_PAGE);
                        
                        let newPage = currentPage;
                        if (i.customId.startsWith('prev')) {
                            newPage = Math.max(0, currentPage - 1);
                        } else if (i.customId.startsWith('next')) {
                            newPage = Math.min(totalPages - 1, currentPage + 1);
                        }

                        const generateEmbed = (pageIndex) => {
                            const start = pageIndex * COMMANDS_PER_PAGE;
                            const end = start + COMMANDS_PER_PAGE;
                            const pageCommands = category.commands.slice(start, end);

                            return new EmbedBuilder()
                                .setTitle(`${category.emoji} ${category.name} Komutları`)
                                .setDescription(`
\`\`\`diff
+ ${category.description}
- Kullanılabilir komutlar aşağıda listelenmiştir\`\`\`

${pageCommands.map(cmd => `**${cmd.name}**
> ${cmd.description}
> 📝 Kullanım: \`${cmd.usage}\`
${cmd.details.map(detail => `> ${detail}`).join('\n')}
`).join('\n')}

*Sayfa ${pageIndex + 1}/${totalPages}*`)
                                .setColor(category.color)
                                .setThumbnail('https://i.imgur.com/nXqD6aG.png')
                                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                                .setTimestamp();
                        };

                        const generateButtons = (pageIndex) => {
                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`prev_${pageIndex}`)
                                        .setLabel('◀️ Önceki Sayfa')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(pageIndex === 0),
                                    new ButtonBuilder()
                                        .setCustomId(`next_${pageIndex}`)
                                        .setLabel('Sonraki Sayfa ▶️')
                                        .setStyle(ButtonStyle.Primary)
                                        .setDisabled(pageIndex === totalPages - 1)
                                );
                            return row;
                        };

                        await i.update({
                            embeds: [generateEmbed(newPage)],
                            components: [menu, generateButtons(newPage)]
                        });
                    }
                } catch (error) {
                    console.error('Etkileşim hatası:', error);
                    if (!i.replied && !i.deferred) {
                        await i.reply({ content: 'Bir hata oluştu!', ephemeral: true });
                    }
                }
            });

            collector.on('end', () => {
                try {
                    const disabledMenu = new ActionRowBuilder()
                        .addComponents(
                            menu.components[0].setDisabled(true)
                        );

                    message.edit({
                        components: [disabledMenu]
                    }).catch(() => {});
                } catch (error) {
                    console.error('Koleksiyon sonlandırma hatası:', error);
                }
            });
        } catch (error) {
            console.error('Yardım komutu hatası:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Bir hata oluştu!', ephemeral: true });
            }
        }
    }
};