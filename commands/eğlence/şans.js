const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('şans')
        .setDescription('Oyunlardaki şansını arttır (saatte bir kullanılabilir)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Global boostTimers Map'ini kullan
        const boostTimers = interaction.client.boostTimers || new Map();
        if (!interaction.client.boostTimers) {
            interaction.client.boostTimers = boostTimers;
        }

        // Kullanıcının son kullanım zamanını kontrol et
        const lastUse = boostTimers.get(userId);
        const now = Date.now();

        if (lastUse && now - lastUse < 3600000) { // 1 saat = 3600000 ms
            const remainingTime = Math.ceil((3600000 - (now - lastUse)) / 60000); // Kalan süreyi dakika cinsinden hesapla
            return interaction.reply({
                content: `Bu komutu ${remainingTime} dakika sonra tekrar kullanabilirsin!`,
                flags: ['Ephemeral']
            });
        }

        // Şans boost'u ver ve süreyi kaydet
        boostTimers.set(userId, now);

        const luck = Math.floor(Math.random() * 101);
        const luckBar = '█'.repeat(luck) + '▒'.repeat(100 - luck);
        const message = luck < 50 ? 'Maalesef bu sefer şanssızsın!' : 'Tebrikler, bu sefer şanslısın!';
        const color = luck < 50 ? '#ff0000' : '#00ff00';

        const embed = new EmbedBuilder()
            .setTitle('🍀 Şans')
            .setDescription(`${interaction.user} şansını test etti!\n\nŞans: ${luck}%\n${luckBar}\n\n${message}`)
            .setColor(color)
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWNhNjA5ZGY5ZjJkZDUyZTQ5ZTM2ZDY4ZmVjZGM0ZTRiNDM5YmZiZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3oriNPdeu2W1aelciY/giphy.gif');

        await interaction.reply({
            embeds: [embed],
            flags: ['Ephemeral']
        });
    }
};
