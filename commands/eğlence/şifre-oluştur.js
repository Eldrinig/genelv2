const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('şifre-oluştur')
        .setDescription('Güçlü bir şifre oluşturur')
        .addIntegerOption(option =>
            option
                .setName('uzunluk')
                .setDescription('Şifre uzunluğu (8-32)')
                .setRequired(false)
                .setMinValue(8)
                .setMaxValue(32)),

    async execute(interaction) {
        const length = interaction.options.getInteger('uzunluk') || 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';

        // En az bir büyük harf, küçük harf, sayı ve özel karakter içermesi için
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 25)];

        // Kalan karakterleri rastgele seç
        for (let i = 4; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Şifreyi karıştır
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        const embed = new EmbedBuilder()
            .setTitle('🔐 Şifre Oluşturuldu')
            .setDescription(`\`${password}\``)
            .addFields(
                { name: 'Uzunluk', value: length.toString(), inline: true },
                { name: 'Güvenlik', value: '🟢 Güçlü', inline: true }
            )
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed],
            ephemeral: true // Şifreyi sadece komutu kullanan kişi görebilir
        });
    }
}; 