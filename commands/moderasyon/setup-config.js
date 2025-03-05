const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('destek-ayarla')
        .setDescription('Destek sistemi ayarlarını yapılandırır')
        .addSubcommand(subcommand =>
            subcommand
                .setName('kategori')
                .setDescription('Destek taleplerinin oluşturulacağı kategoriyi ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kategori')
                        .setDescription('Destek talepleri için kategori')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('yetkili-rol')
                .setDescription('Destek yetkilisi rolünü ayarlar')
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Destek yetkilisi rolü')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('log-kanal')
                .setDescription('Transcript kayıtlarının gönderileceği kanalı ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Log kanalı')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('limit')
                .setDescription('Kullanıcı başına maksimum talep sayısını ayarlar')
                .addIntegerOption(option =>
                    option
                        .setName('sayi')
                        .setDescription('Maksimum talep sayısı')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(10)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Sadece sunucu sahibi veya yönetici yetkisi olanlar kullanabilir
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && 
            interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!',
                ephemeral: true
            });
        }

        const config = require('../../config.json');
        const subcommand = interaction.options.getSubcommand();
        let updatedValue;

        switch (subcommand) {
            case 'kategori':
                const category = interaction.options.getChannel('kategori');
                config.supportCategoryId = category.id;
                updatedValue = `<#${category.id}>`;
                break;

            case 'yetkili-rol':
                const role = interaction.options.getRole('rol');
                config.supportRoleId = role.id;
                updatedValue = `<@&${role.id}>`;
                break;

            case 'log-kanal':
                const channel = interaction.options.getChannel('kanal');
                config.transcriptChannelId = channel.id;
                updatedValue = `<#${channel.id}>`;
                break;

            case 'limit':
                const limit = interaction.options.getInteger('sayi');
                config.maxTicketsPerUser = limit;
                updatedValue = limit;
                break;
        }

        // Yapılandırmayı kaydet
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

        // Config cache'ini temizle ve yeniden yükle
        delete require.cache[require.resolve('../config.json')];
        const updatedConfig = require('../../config.json');

        const embed = new EmbedBuilder()
            .setTitle('✅ Ayarlar Güncellendi')
            .setDescription(`${subcommand.charAt(0).toUpperCase() + subcommand.slice(1)} ayarı başarıyla güncellendi.\n\n` +
                           `Yeni değer: ${updatedValue}`)
            .setColor('#00ff00')
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}; 