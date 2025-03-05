const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { kelimeler } = require('../commands/eğlence/kelime.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Modal submit işlemleri için
        if (interaction.isModalSubmit()) {
            const [action, type, gameId] = interaction.customId.split('_');

            try {
                if (action === 'kelime') {
                    const game = interaction.client.kelimeGames.get(gameId);
                    if (!game) {
                        return interaction.reply({
                            content: 'Bu oyun artık geçerli değil!',
                            flags: ['Ephemeral']
                        });
                    }

                    const isChallenger = interaction.user.id === game.challenger;
                    
                    // Kelime tahmini modalı
                    if (type === 'word') {
                        const kelime = interaction.fields.getTextInputValue('kelime').toUpperCase();

                        if (kelime === game.word) {
                            // Kelime doğru tahmin edildi
                            const embed = new EmbedBuilder()
                                .setTitle('📝 Kelime Tahmin - Oyun Bitti!')
                                .setDescription(`🎉 Tebrikler! <@${interaction.user.id}> kelimeyi buldu!\nKelime: ${game.word}`)
                                .setColor('#00ff00')
                                .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWQ4ZWU4ZmYwZWU0ZDZkZWRmNzE5YmRmZjc5ZGRkMGM5ZGU4ZDk5YiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o7btZ1Gm7ZL25pLMs/giphy.gif');

                            interaction.client.kelimeGames.delete(gameId);
                            
                            // Önceki mesajı sil ve yeni mesajı gönder
                            if (game.lastMessageId) {
                                await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                            }
                            const newMessage = await interaction.channel.send({
                                embeds: [embed],
                                components: []
                            });
                            return interaction.deferUpdate();
                        } else {
                            // Yanlış kelime tahmini
                            if (isChallenger) {
                                game.challengerGuesses--;
                            } else {
                                game.opponentGuesses--;
                            }

                            if (game.challengerGuesses === 0 || game.opponentGuesses === 0) {
                                // Şans faktörü - %30 ihtimalle ekstra hak
                                const extraChance = Math.random() < 0.30;
                                
                                if (extraChance) {
                                    // Ekstra hak ver
                                    if (game.challengerGuesses === 0) {
                                        game.challengerGuesses = 1;
                                        await interaction.channel.send({
                                            content: `🎭 Eldrin <@${game.challenger}>'a bir tahmin hakkı hediye etti! Şanslı günündesin!`,
                                            flags: ['Ephemeral']
                                        });
                                    } else {
                                        game.opponentGuesses = 1;
                                        await interaction.channel.send({
                                            content: `🎭 Eldrin <@${game.opponent}>'a bir tahmin hakkı hediye etti! Şanslı günündesin!`,
                                            flags: ['Ephemeral']
                                        });
                                    }
                                    
                                    // Oyunu devam ettir
                                    const embed = new EmbedBuilder()
                                        .setTitle('📝 Kelime Tahmin')
                                        .setDescription(`Kelime: ${game.revealed.join(' ')} (${game.word.length} harf)\nSıra: <@${game.currentTurn}>'da\n\nKalan Tahmin Hakları:\n<@${game.challenger}>: ${game.challengerGuesses}\n<@${game.opponent}>: ${game.opponentGuesses}\n\nTahmin edilen harfler: ${game.guessedLetters.join(', ')}`)
                                        .setColor('#ffa500');

                                    const tahminButton = new ButtonBuilder()
                                        .setCustomId(`kelime_guess_${gameId}`)
                                        .setLabel('Harf Tahmin Et')
                                        .setStyle(ButtonStyle.Primary);

                                    const kelimeTahminButton = new ButtonBuilder()
                                        .setCustomId(`kelime_word_${gameId}`)
                                        .setLabel('Kelimeyi Tahmin Et')
                                        .setStyle(ButtonStyle.Success);

                                    const row = new ActionRowBuilder().addComponents(tahminButton, kelimeTahminButton);

                                    // Önceki mesajı sil ve yeni mesajı gönder
                                    if (game.lastMessageId) {
                                        await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                                    }
                                    const newMessage = await interaction.channel.send({
                                        embeds: [embed],
                                        components: [row]
                                    });
                                    game.lastMessageId = newMessage.id;
                                    return interaction.deferUpdate();
                                } else {
                                    // Oyun bitti - Bot kazandı
                                    const embed = new EmbedBuilder()
                                        .setTitle('📝 Kelime Tahmin - Oyun Bitti!')
                                        .setDescription(`🤖 Bot kazandı! Kelime: ${game.word}\nOyuncular kelimeyi bulamadı.`)
                                        .setColor('#ff0000')
                                        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmZrYWdxOGt6ZXhwdnJ4OXh5ZHJxbWR6YXhyaGRyaHhyeGVyY2VyZyZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/JER2en0ZRiGUE/giphy.gif');

                                    interaction.client.kelimeGames.delete(gameId);
                                    // Önceki mesajı sil ve yeni mesajı gönder
                                    if (game.lastMessageId) {
                                        await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                                    }
                                    const newMessage = await interaction.channel.send({
                                        embeds: [embed],
                                        components: []
                                    });
                                    return interaction.deferUpdate();
                                }
                            }

                            const embed = new EmbedBuilder()
                                .setTitle('📝 Kelime Tahmin')
                                .setDescription(`<@${interaction.user.id}> kelimeyi yanlış tahmin etti: "${kelime}"\nKelime: ${game.revealed.join(' ')} (${game.word.length} harf)\nSıra: <@${game.currentTurn === game.challenger ? game.opponent : game.challenger}>'da\n\nKalan Tahmin Hakları:\n<@${game.challenger}>: ${game.challengerGuesses}\n<@${game.opponent}>: ${game.opponentGuesses}\n\nTahmin edilen harfler: ${game.guessedLetters.join(', ')}`)
                                .setColor('#ff0000');

                            game.currentTurn = game.currentTurn === game.challenger ? game.opponent : game.challenger;

                            const tahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_guess_${gameId}`)
                                .setLabel('Harf Tahmin Et')
                                .setStyle(ButtonStyle.Primary);

                            const kelimeTahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_word_${gameId}`)
                                .setLabel('Kelimeyi Tahmin Et')
                                .setStyle(ButtonStyle.Success);

                            const row = new ActionRowBuilder().addComponents(tahminButton, kelimeTahminButton);

                            // Önceki mesajı sil ve yeni mesajı gönder
                            if (game.lastMessageId) {
                                await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                            }
                            const newMessage = await interaction.channel.send({
                                embeds: [embed],
                                components: [row]
                            });
                            game.lastMessageId = newMessage.id;
                            return interaction.deferUpdate();
                        }
                    }
                    // Harf tahmini modalı
                    else if (type === 'guess') {
                        const tahmin = interaction.fields.getTextInputValue('tahmin').toUpperCase();

                        if (!/^[A-ZĞÜŞİÖÇ]$/.test(tahmin)) {
                            return interaction.reply({
                                content: 'Lütfen sadece büyük Türkçe harf girin!',
                                flags: ['Ephemeral']
                            });
                        }

                        if (game.guessedLetters.includes(tahmin)) {
                            return interaction.reply({
                                content: 'Bu harf daha önce tahmin edildi!',
                                flags: ['Ephemeral']
                            });
                        }

                        game.guessedLetters.push(tahmin);

                        if (game.word.includes(tahmin)) {
                            // Doğru harf tahmini - harfleri sırayla göster
                            let found = false;
                            for (let i = 0; i < game.word.length; i++) {
                                if (game.word[i] === tahmin && game.revealed[i] === '_') {
                                    game.revealed[i] = tahmin;
                                    found = true;
                                    break; // İlk bulunan harfi göster ve döngüden çık
                                }
                            }
                            
                            if (!found) {
                                return interaction.reply({
                                    content: 'Bu harf zaten açılmış!',
                                    flags: ['Ephemeral']
                                });
                            }

                            const revealedWord = game.revealed.join(' ');
                            if (!game.revealed.includes('_')) {
                                // Kelime tamamlandı
                                const embed = new EmbedBuilder()
                                    .setTitle('📝 Kelime Tahmin - Oyun Bitti!')
                                    .setDescription(`🎉 Tebrikler! <@${interaction.user.id}> kelimeyi buldu!\nKelime: ${game.word}`)
                                    .setColor('#00ff00')
                                    .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWQ4ZWU4ZmYwZWU0ZDZkZWRmNzE5YmRmZjc5ZGRkMGM5ZGU4ZDk5YiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o7btZ1Gm7ZL25pLMs/giphy.gif');

                                interaction.client.kelimeGames.delete(gameId);
                                // Önceki mesajı sil ve yeni mesajı gönder
                                if (game.lastMessageId) {
                                    await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                                }
                                const newMessage = await interaction.channel.send({
                                    embeds: [embed],
                                    components: []
                                });
                                return interaction.deferUpdate();
                            }

                            const embed = new EmbedBuilder()
                                .setTitle('📝 Kelime Tahmin')
                                .setDescription(`Doğru tahmin! "${tahmin}" harfi kelimede var!\nKelime: ${revealedWord} (${game.word.length} harf)\nSıra: <@${game.currentTurn === game.challenger ? game.opponent : game.challenger}>'da\n\nKalan Tahmin Hakları:\n<@${game.challenger}>: ${game.challengerGuesses}\n<@${game.opponent}>: ${game.opponentGuesses}\n\nTahmin edilen harfler: ${game.guessedLetters.join(', ')}`)
                                .setColor('#00ff00');

                            game.currentTurn = game.currentTurn === game.challenger ? game.opponent : game.challenger;

                            const tahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_guess_${gameId}`)
                                .setLabel('Harf Tahmin Et')
                                .setStyle(ButtonStyle.Primary);

                            const kelimeTahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_word_${gameId}`)
                                .setLabel('Kelimeyi Tahmin Et')
                                .setStyle(ButtonStyle.Success);

                            const row = new ActionRowBuilder().addComponents(tahminButton, kelimeTahminButton);

                            // Önceki mesajı sil ve yeni mesajı gönder
                            if (game.lastMessageId) {
                                await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                            }
                            const newMessage = await interaction.channel.send({
                                embeds: [embed],
                                components: [row]
                            });
                            game.lastMessageId = newMessage.id;
                            return interaction.deferUpdate();
                        } else {
                            // Yanlış harf tahmini
                            if (isChallenger) {
                                game.challengerGuesses--;
                            } else {
                                game.opponentGuesses--;
                            }

                            if (game.challengerGuesses === 0 || game.opponentGuesses === 0) {
                                // Şans faktörü - %30 ihtimalle ekstra hak
                                const extraChance = Math.random() < 0.30;
                                
                                if (extraChance) {
                                    // Ekstra hak ver
                                    if (game.challengerGuesses === 0) {
                                        game.challengerGuesses = 1;
                                        await interaction.channel.send({
                                            content: `🎭 Eldrin <@${game.challenger}>'a bir tahmin hakkı hediye etti! Şanslı günündesin!`,
                                            flags: ['Ephemeral']
                                        });
                                    } else {
                                        game.opponentGuesses = 1;
                                        await interaction.channel.send({
                                            content: `🎭 Eldrin <@${game.opponent}>'a bir tahmin hakkı hediye etti! Şanslı günündesin!`,
                                            flags: ['Ephemeral']
                                        });
                                    }
                                    
                                    // Oyunu devam ettir
                                    const embed = new EmbedBuilder()
                                        .setTitle('📝 Kelime Tahmin')
                                        .setDescription(`Kelime: ${game.revealed.join(' ')} (${game.word.length} harf)\nSıra: <@${game.currentTurn}>'da\n\nKalan Tahmin Hakları:\n<@${game.challenger}>: ${game.challengerGuesses}\n<@${game.opponent}>: ${game.opponentGuesses}\n\nTahmin edilen harfler: ${game.guessedLetters.join(', ')}`)
                                        .setColor('#ffa500');

                                    const tahminButton = new ButtonBuilder()
                                        .setCustomId(`kelime_guess_${gameId}`)
                                        .setLabel('Harf Tahmin Et')
                                        .setStyle(ButtonStyle.Primary);

                                    const kelimeTahminButton = new ButtonBuilder()
                                        .setCustomId(`kelime_word_${gameId}`)
                                        .setLabel('Kelimeyi Tahmin Et')
                                        .setStyle(ButtonStyle.Success);

                                    const row = new ActionRowBuilder().addComponents(tahminButton, kelimeTahminButton);

                                    // Önceki mesajı sil ve yeni mesajı gönder
                                    if (game.lastMessageId) {
                                        await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                                    }
                                    const newMessage = await interaction.channel.send({
                                        embeds: [embed],
                                        components: [row]
                                    });
                                    game.lastMessageId = newMessage.id;
                                    return interaction.deferUpdate();
                                } else {
                                    // Oyun bitti - Bot kazandı
                                    const embed = new EmbedBuilder()
                                        .setTitle('📝 Kelime Tahmin - Oyun Bitti!')
                                        .setDescription(`🤖 Bot kazandı! Kelime: ${game.word}\nOyuncular kelimeyi bulamadı.`)
                                        .setColor('#ff0000')
                                        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmZrYWdxOGt6ZXhwdnJ4OXh5ZHJxbWR6YXhyaGRyaHhyeGVyY2VyZyZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/JER2en0ZRiGUE/giphy.gif');

                                    interaction.client.kelimeGames.delete(gameId);
                                    // Önceki mesajı sil ve yeni mesajı gönder
                                    if (game.lastMessageId) {
                                        await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                                    }
                                    const newMessage = await interaction.channel.send({
                                        embeds: [embed],
                                        components: []
                                    });
                                    return interaction.deferUpdate();
                                }
                            }

                            const embed = new EmbedBuilder()
                                .setTitle('📝 Kelime Tahmin')
                                .setDescription(`Yanlış tahmin! "${tahmin}" harfi kelimede yok!\nKelime: ${game.revealed.join(' ')} (${game.word.length} harf)\nSıra: <@${game.currentTurn === game.challenger ? game.opponent : game.challenger}>'da\n\nKalan Tahmin Hakları:\n<@${game.challenger}>: ${game.challengerGuesses}\n<@${game.opponent}>: ${game.opponentGuesses}\n\nTahmin edilen harfler: ${game.guessedLetters.join(', ')}`)
                                .setColor('#ff0000');

                            game.currentTurn = game.currentTurn === game.challenger ? game.opponent : game.challenger;

                            const tahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_guess_${gameId}`)
                                .setLabel('Harf Tahmin Et')
                                .setStyle(ButtonStyle.Primary);

                            const kelimeTahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_word_${gameId}`)
                                .setLabel('Kelimeyi Tahmin Et')
                                .setStyle(ButtonStyle.Success);

                            const row = new ActionRowBuilder().addComponents(tahminButton, kelimeTahminButton);

                            // Önceki mesajı sil ve yeni mesajı gönder
                            if (game.lastMessageId) {
                                await interaction.channel.messages.delete(game.lastMessageId).catch(console.error);
                            }
                            const newMessage = await interaction.channel.send({
                                embeds: [embed],
                                components: [row]
                            });
                            game.lastMessageId = newMessage.id;
                            return interaction.deferUpdate();
                        }
                    }
                }
            } catch (error) {
                console.error('Modal hatası:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Bir hata oluştu!',
                        flags: ['Ephemeral']
                    }).catch(console.error);
                }
            }
        }

        // Button interactions
        if (interaction.isButton()) {
            const [action, type, ...args] = interaction.customId.split('_');

            try {
                if (action === 'kelime') {
                    if (type === 'guess') {
                        const gameId = args[0];
                        const game = interaction.client.kelimeGames.get(gameId);

                        if (!game) {
                            return interaction.reply({
                                content: 'Bu oyun artık geçerli değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        if (interaction.user.id !== game.currentTurn) {
                            return interaction.reply({
                                content: 'Sıra sende değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        const modal = new ModalBuilder()
                            .setCustomId(`kelime_guess_${gameId}`)
                            .setTitle('Harf Tahmin Et');

                        const tahminInput = new TextInputBuilder()
                            .setCustomId('tahmin')
                            .setLabel('Bir harf girin (Büyük Türkçe harf)')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(1)
                            .setRequired(true);

                        const row = new ActionRowBuilder().addComponents(tahminInput);
                        modal.addComponents(row);

                        await interaction.showModal(modal);
                    }
                    else if (type === 'word') {
                        const gameId = args[0];
                        const game = interaction.client.kelimeGames.get(gameId);

                        if (!game) {
                            return interaction.reply({
                                content: 'Bu oyun artık geçerli değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        if (interaction.user.id !== game.currentTurn) {
                            return interaction.reply({
                                content: 'Sıra sende değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        const modal = new ModalBuilder()
                            .setCustomId(`kelime_word_${gameId}`)
                            .setTitle('Kelimeyi Tahmin Et');

                        const kelimeInput = new TextInputBuilder()
                            .setCustomId('kelime')
                            .setLabel('Kelime tahmininizi girin')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const row = new ActionRowBuilder().addComponents(kelimeInput);
                        modal.addComponents(row);

                        await interaction.showModal(modal);
                    }
                }
            } catch (error) {
                console.error('Buton hatası:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Bir hata oluştu!',
                        flags: ['Ephemeral']
                    }).catch(console.error);
                }
            }
        }

        // Slash komutları için
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`${interaction.commandName} komutu bulunamadı.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: 'Komutu çalıştırırken bir hata oluştu!', 
                        flags: ['Ephemeral']
                    }).catch(console.error);
                }
            }
        }
        
        // Buton ve menü etkileşimleri için
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const [action, type, ...args] = interaction.customId.split('_');

            // Yardım menüsü için
            if (action === 'help') {
                const userId = args[0];
                if (interaction.user.id !== userId) return;

                let embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTimestamp();

                switch (interaction.values[0]) {
                    case 'moderasyon':
                        embed.setTitle('🛡️ Moderasyon Komutları')
                            .setDescription('Sunucuyu yönetmek için kullanabileceğin komutlar:')
                            .addFields(
                                { name: '/ban', value: 'Kullanıcıyı sunucudan yasaklar' },
                                { name: '/kick', value: 'Kullanıcıyı sunucudan atar' },
                                { name: '/timeout', value: 'Kullanıcıya zaman aşımı verir' },
                                { name: '/sil', value: 'Belirtilen sayıda mesajı siler' }
                            );
                        break;

                    case 'eğlence':
                        embed.setTitle('🎮 Eğlence Komutları')
                            .setDescription('Eğlenmek için kullanabileceğin komutlar:')
                            .addFields(
                                { name: '/aşk-ölçer', value: 'İki kişi arasındaki aşkı ölçer' },
                                { name: '/avatar', value: 'Kullanıcının avatarını gösterir' },
                                { name: '/espri', value: 'Rastgele bir espri yapar' },
                                { name: '/şans', value: 'Şansını artırır (Saatlik)' }
                            );
                        break;

                    case 'araçlar':
                        embed.setTitle('🔧 Araç Komutları')
                            .setDescription('Yardımcı araç komutları:')
                            .addFields(
                                { name: '/ping', value: 'Botun gecikme süresini gösterir' },
                                { name: '/sunucu', value: 'Sunucu bilgilerini gösterir' },
                                { name: '/profil', value: 'Kullanıcı profilini gösterir' }
                            );
                        break;

                    case 'oyunlar':
                        embed.setTitle('🎲 İki Kişilik Oyunlar')
                            .setDescription('Arkadaşlarınla oynayabileceğin oyunlar:')
                            .addFields(
                                { name: '/tkm', value: '🎮 Taş Kağıt Makas\nArkadaşınla taş kağıt makas oyna!' },
                                { name: '/rulet', value: '🎯 Rus Ruleti\nArkadaşınla tehlikeli bir rulet oyunu oyna!' },
                                { name: '/kelime', value: '📝 Kelime Tahmin\nBelirli harf haklarıyla kelimeyi tahmin etmeye çalış!' },
                                { name: '/sayı', value: '🔢 Sayı Tahmin\n1-100 arası sayıyı tahmin etmeye çalış!' },
                                { name: '💡 İpucu', value: 'Oyunlarda şansını artırmak için `/şans` komutunu kullanabilirsin!' }
                            )
                            .setFooter({ text: 'Daha fazla oyun yakında eklenecek!' });
                        break;
                }

                await interaction.update({ embeds: [embed], components: [interaction.message.components[0]] });
            }

            // Oyun etkileşimleri
            else if (action === 'tkm' || action === 'rulet' || action === 'kelime' || action === 'sayı') {
                try {
                    if (type === 'accept') {
                        const [challengerId, opponentId] = args;
                        if (interaction.user.id !== opponentId) return;

                        if (action === 'tkm') {
                            const gameId = interaction.message.id;
                            interaction.client.tkmGames.set(gameId, {
                                challenger: challengerId,
                                opponent: opponentId,
                                challengerChoice: null,
                                opponentChoice: null
                            });

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`tkm_choice_${gameId}_taş`)
                                        .setLabel('Taş')
                                        .setEmoji('🪨')
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`tkm_choice_${gameId}_kağıt`)
                                        .setLabel('Kağıt')
                                        .setEmoji('📄')
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId(`tkm_choice_${gameId}_makas`)
                                        .setLabel('Makas')
                                        .setEmoji('✂️')
                                        .setStyle(ButtonStyle.Primary)
                                );

                            await interaction.update({
                                content: 'Oyun başladı! Her iki oyuncu da seçimini yapsın.',
                                components: [row]
                            });

                            // Her iki oyuncuya da ayrı gizli mesaj gönder
                            await interaction.followUp({
                                content: `<@${challengerId}>, seçimini yap:`,
                                components: [row],
                                flags: ['Ephemeral']
                            });

                            await interaction.followUp({
                                content: `<@${opponentId}>, seçimini yap:`,
                                components: [row],
                                flags: ['Ephemeral']
                            });
                        }
                        else if (action === 'rulet') {
                            const gameId = interaction.message.id;
                            const bulletPosition = Math.floor(Math.random() * 6);

                            interaction.client.ruletGames.set(gameId, {
                                challenger: challengerId,
                                opponent: opponentId,
                                currentPosition: 0,
                                bulletPosition: bulletPosition,
                                currentTurn: challengerId
                            });

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`rulet_shoot_${gameId}`)
                                        .setLabel('Tetik Çek')
                                        .setEmoji('🔫')
                                        .setStyle(ButtonStyle.Danger)
                                );

                            const embed = new EmbedBuilder()
                                .setTitle('🎮 Rus Ruleti')
                                .setDescription(`Oyun başladı!\nSıra: <@${challengerId}>'da`)
                                .setColor('#ff0000')
                                .setFooter({ text: 'Şans boost aktifse hayatta kalma şansınız artar!' });

                            await interaction.update({
                                content: '',
                                embeds: [embed],
                                components: [row]
                            });
                        }
                        else if (action === 'kelime') {
                            const gameId = interaction.message.id;
                            const seçilenKelime = kelimeler[Math.floor(Math.random() * kelimeler.length)];
                            
                            interaction.client.kelimeGames.set(gameId, {
                                word: seçilenKelime,
                                revealed: Array(seçilenKelime.length).fill('_'),
                                challenger: challengerId,
                                opponent: opponentId,
                                currentTurn: challengerId,
                                challengerGuesses: 3,
                                opponentGuesses: 3,
                                guessedLetters: [],
                                lastMessageId: null // Son mesajın ID'sini takip etmek için
                            });

                            const embed = new EmbedBuilder()
                                .setTitle('📝 Kelime Tahmin')
                                .setDescription(`Oyun başladı!\nKelime: ${Array(seçilenKelime.length).fill('_').join(' ')} (${seçilenKelime.length} harf)\nSıra: <@${challengerId}>'da\n\nKalan Tahmin Hakları:\n<@${challengerId}>: 3\n<@${opponentId}>: 3`)
                                .setColor('#00ff00')
                                .setFooter({ text: 'Tahmininizi yapmak için harf yazın (Büyük harf)' });

                            const tahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_guess_${gameId}`)
                                .setLabel('Harf Tahmin Et')
                                .setStyle(ButtonStyle.Primary);

                            const kelimeTahminButton = new ButtonBuilder()
                                .setCustomId(`kelime_word_${gameId}`)
                                .setLabel('Kelimeyi Tahmin Et')
                                .setStyle(ButtonStyle.Success);

                            const row = new ActionRowBuilder().addComponents(tahminButton, kelimeTahminButton);

                            await interaction.update({
                                content: '',
                                embeds: [embed],
                                components: [row]
                            });
                        }
                        else if (action === 'sayı') {
                            const gameId = interaction.message.id;
                            const hedefSayı = Math.floor(Math.random() * 100) + 1;
                            
                            interaction.client.sayıGames.set(gameId, {
                                challenger: challengerId,
                                opponent: opponentId,
                                number: hedefSayı,
                                challengerGuesses: [],
                                opponentGuesses: [],
                                currentTurn: challengerId
                            });

                            const embed = new EmbedBuilder()
                                .setTitle('🔢 Sayı Tahmin')
                                .setDescription(`Oyun başladı!\n1-100 arası bir sayı seçildi.\nSıra: <@${challengerId}>'da\n\nKalan Tahmin Hakları:\n<@${challengerId}>: 5\n<@${opponentId}>: 5`)
                                .setColor('#00ff00')
                                .setFooter({ text: 'Tahmininizi yapmak için bir sayı yazın (1-100)' });

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`sayı_guess_${gameId}`)
                                        .setLabel('Sayı Tahmin Et')
                                        .setStyle(ButtonStyle.Primary)
                                );

                            await interaction.update({
                                content: '',
                                embeds: [embed],
                                components: [row]
                            });
                        }
                    }
                    else if (type === 'reject') {
                        await interaction.update({
                            content: 'Oyun reddedildi!',
                            embeds: [],
                            components: []
                        });
                    }
                    else if (type === 'choice' && action === 'tkm') {
                        const [gameId, choice] = args;
                        const game = interaction.client.tkmGames.get(gameId);
                        if (!game) {
                            return interaction.reply({
                                content: 'Bu oyun artık geçerli değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        const isChallenger = interaction.user.id === game.challenger;
                        const isOpponent = interaction.user.id === game.opponent;

                        if (!isChallenger && !isOpponent) {
                            return interaction.reply({
                                content: 'Bu oyunun bir parçası değilsin!',
                                flags: ['Ephemeral']
                            });
                        }

                        if (isChallenger) {
                            if (game.challengerChoice) {
                                return interaction.reply({
                                    content: 'Zaten seçimini yaptın!',
                                    flags: ['Ephemeral']
                                });
                            }
                            game.challengerChoice = choice;
                        } else {
                            if (game.opponentChoice) {
                                return interaction.reply({
                                    content: 'Zaten seçimini yaptın!',
                                    flags: ['Ephemeral']
                                });
                            }
                            game.opponentChoice = choice;
                        }

                        await interaction.reply({
                            content: 'Seçimin kaydedildi! Diğer oyuncunun seçimini bekliyoruz...',
                            flags: ['Ephemeral']
                        });

                        if (game.challengerChoice && game.opponentChoice) {
                            const challenger = await interaction.client.users.fetch(game.challenger);
                            const opponent = await interaction.client.users.fetch(game.opponent);

                            const emoji = {
                                'taş': '🪨',
                                'kağıt': '📄',
                                'makas': '✂️'
                            };

                            let result;
                            if (game.challengerChoice === game.opponentChoice) {
                                result = { winner: null, message: 'Berabere!', color: '#ffff00' };
                            } else if (
                                (game.challengerChoice === 'taş' && game.opponentChoice === 'makas') ||
                                (game.challengerChoice === 'kağıt' && game.opponentChoice === 'taş') ||
                                (game.challengerChoice === 'makas' && game.opponentChoice === 'kağıt')
                            ) {
                                result = { winner: 'challenger', message: `${challenger.username} kazandı!`, color: '#00ff00' };
                            } else {
                                result = { winner: 'opponent', message: `${opponent.username} kazandı!`, color: '#00ff00' };
                            }

                            const embed = new EmbedBuilder()
                                .setTitle('🎮 Taş Kağıt Makas - Sonuç')
                                .setDescription(result.message)
                                .addFields(
                                    { name: challenger.username, value: `${emoji[game.challengerChoice]} ${game.challengerChoice}`, inline: true },
                                    { name: 'VS', value: '⚔️', inline: true },
                                    { name: opponent.username, value: `${emoji[game.opponentChoice]} ${game.opponentChoice}`, inline: true }
                                )
                                .setColor(result.color);

                            try {
                                const message = await interaction.message.fetch();
                                await message.edit({
                                    content: '',
                                    embeds: [embed],
                                    components: []
                                });
                            } catch (error) {
                                console.error('Mesaj güncellenirken hata:', error);
                                await interaction.followUp({
                                    embeds: [embed],
                                    flags: ['Ephemeral']
                                });
                            }

                            interaction.client.tkmGames.delete(gameId);
                        }
                    }
                    else if (type === 'shoot' && action === 'rulet') {
                        const [gameId] = args;
                        const game = interaction.client.ruletGames.get(gameId);
                        if (!game) {
                            return interaction.reply({
                                content: 'Bu oyun artık geçerli değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        if (interaction.user.id !== game.currentTurn) {
                            return interaction.reply({
                                content: 'Sıra sende değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        game.currentPosition++;
                        const isDead = game.currentPosition - 1 === game.bulletPosition;

                        const nextTurn = game.currentTurn === game.challenger ? game.opponent : game.challenger;
                        game.currentTurn = nextTurn;

                        if (isDead) {
                            const embed = new EmbedBuilder()
                                .setTitle('🎮 Rus Ruleti - Oyun Bitti!')
                                .setDescription(`💥 **BANG!**\n<@${interaction.user.id}> vuruldu!\n<@${nextTurn}> kazandı!`)
                                .setColor('#ff0000')
                                .setFooter({ text: `Mermi ${game.currentPosition}. tetik çekişte geldi!` });

                            interaction.client.ruletGames.delete(gameId);

                            await interaction.update({
                                embeds: [embed],
                                components: []
                            });
                        } else {
                            const embed = new EmbedBuilder()
                                .setTitle('🎮 Rus Ruleti')
                                .setDescription(`*click*\nSıra: <@${nextTurn}>'da`)
                                .setColor('#ff0000')
                                .setFooter({ text: `${game.currentPosition}. tetik çekildi...` });

                            await interaction.update({
                                embeds: [embed],
                                components: [interaction.message.components[0]]
                            });
                        }
                    }
                    else if (type === 'guess') {
                        const [gameId] = args;
                        
                        if (action === 'kelime') {
                            const game = interaction.client.kelimeGames.get(gameId);
                            if (!game) {
                                return interaction.reply({
                                    content: 'Bu oyun artık geçerli değil!',
                                    flags: ['Ephemeral']
                                });
                            }

                            if (interaction.user.id !== game.currentTurn) {
                                return interaction.reply({
                                    content: 'Sıra sende değil!',
                                    flags: ['Ephemeral']
                                });
                            }

                            // Modal oluştur
                            const modal = new ModalBuilder()
                                .setCustomId(`kelime_modal_${gameId}`)
                                .setTitle('Tahmin Et');

                            const tahminSelect = new TextInputBuilder()
                                .setCustomId('tahmin')
                                .setLabel('Harf veya kelime tahmininizi girin')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true);

                            const row = new ActionRowBuilder().addComponents(tahminSelect);
                            modal.addComponents(row);

                            await interaction.showModal(modal);
                        }
                        else if (action === 'sayı') {
                            const game = interaction.client.sayıGames.get(gameId);
                            if (!game) {
                                return interaction.reply({
                                    content: 'Bu oyun artık geçerli değil!',
                                    flags: ['Ephemeral']
                                });
                            }

                            if (interaction.user.id !== game.currentTurn) {
                                return interaction.reply({
                                    content: 'Sıra sende değil!',
                                    flags: ['Ephemeral']
                                });
                            }

                            // Modal oluştur
                            const modal = new ModalBuilder()
                                .setCustomId(`sayı_modal_${gameId}`)
                                .setTitle('Sayı Tahmini');

                            const sayıInput = new TextInputBuilder()
                                .setCustomId('sayı')
                                .setLabel('Bir sayı girin (1-100)')
                                .setStyle(TextInputStyle.Short)
                                .setMinLength(1)
                                .setMaxLength(3)
                                .setRequired(true);

                            const firstActionRow = new ActionRowBuilder().addComponents(sayıInput);
                            modal.addComponents(firstActionRow);

                            await interaction.showModal(modal);
                        }
                    }
                    else if (type === 'word') {
                        const gameId = interaction.customId.split('_')[2];
                        const game = interaction.client.kelimeGames.get(gameId);

                        if (!game) {
                            return interaction.reply({
                                content: 'Bu oyun artık geçerli değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        if (interaction.user.id !== game.currentTurn) {
                            return interaction.reply({
                                content: 'Sıra sende değil!',
                                flags: ['Ephemeral']
                            });
                        }

                        // Modal oluştur
                        const modal = new ModalBuilder()
                            .setCustomId(`kelime_word_modal_${gameId}`)
                            .setTitle('Kelimeyi Tahmin Et');

                        const kelimeInput = new TextInputBuilder()
                            .setCustomId('kelime')
                            .setLabel('Kelime tahmininizi girin')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const row = new ActionRowBuilder().addComponents(kelimeInput);
                        modal.addComponents(row);

                        await interaction.showModal(modal);
                    }
                } catch (error) {
                    console.error('Oyun hatası:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Bir hata oluştu!',
                            flags: ['Ephemeral']
                        }).catch(console.error);
                    }
                }
            }
        }
    }
};