const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sunucu-ayar')
        .setDescription('Sunucu ayarlarını yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('isim')
                .setDescription('Sunucu ismini değiştirir')
                .addStringOption(option =>
                    option
                        .setName('isim')
                        .setDescription('Yeni sunucu ismi')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('afk')
                .setDescription('AFK kanalını ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('AFK kanalı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sistem')
                .setDescription('Sistem mesajları kanalını ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Sistem mesajları kanalı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('seviye')
                .setDescription('Sunucu doğrulama seviyesini ayarlar')
                .addStringOption(option =>
                    option
                        .setName('seviye')
                        .setDescription('Doğrulama seviyesi')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Yok', value: 'NONE' },
                            { name: 'Düşük', value: 'LOW' },
                            { name: 'Orta', value: 'MEDIUM' },
                            { name: 'Yüksek', value: 'HIGH' },
                            { name: 'Çok Yüksek', value: 'VERY_HIGH' }
                        ))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'isim': {
                const newName = interaction.options.getString('isim');
                await interaction.guild.setName(newName);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Sunucu İsmi Değiştirildi')
                    .setColor('#00ff00')
                    .setDescription(`Yeni sunucu ismi: ${newName}`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'afk': {
                const channel = interaction.options.getChannel('kanal');
                await interaction.guild.setAFKChannel(channel);

                const embed = new EmbedBuilder()
                    .setTitle('✅ AFK Kanalı Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`AFK kanalı ${channel} olarak ayarlandı.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'sistem': {
                const channel = interaction.options.getChannel('kanal');
                await interaction.guild.setSystemChannel(channel);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Sistem Kanalı Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`Sistem mesajları kanalı ${channel} olarak ayarlandı.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'seviye': {
                const level = interaction.options.getString('seviye');
                await interaction.guild.setVerificationLevel(level);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Doğrulama Seviyesi Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`Sunucu doğrulama seviyesi ${level} olarak ayarlandı.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 