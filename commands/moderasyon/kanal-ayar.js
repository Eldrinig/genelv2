const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kanal-ayar')
        .setDescription('Kanal ayarlarını yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand =>
            subcommand
                .setName('yavaş-mod')
                .setDescription('Kanala yavaş mod ekler')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Ayarlanacak kanal')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('süre')
                        .setDescription('Yavaş mod süresi (saniye)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(21600)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kilitli')
                .setDescription('Kanalı kilitler/kilidini açar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Ayarlanacak kanal')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addBooleanOption(option =>
                    option
                        .setName('kilitli')
                        .setDescription('Kanal kilitli olsun mu?')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('isim')
                .setDescription('Kanal ismini değiştirir')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Ayarlanacak kanal')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('isim')
                        .setDescription('Yeni kanal ismi')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('kanal');

        switch (subcommand) {
            case 'yavaş-mod': {
                const duration = interaction.options.getInteger('süre');
                await channel.setRateLimitPerUser(duration);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Yavaş Mod Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`${channel} kanalında yavaş mod ${duration} saniye olarak ayarlandı.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'kilitli': {
                const locked = interaction.options.getBoolean('kilitli');
                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: !locked
                });

                const embed = new EmbedBuilder()
                    .setTitle(locked ? '🔒 Kanal Kilitlendi' : '🔓 Kanal Kilidi Açıldı')
                    .setColor(locked ? '#ff0000' : '#00ff00')
                    .setDescription(`${channel} kanalı ${locked ? 'kilitlendi' : 'kilidi açıldı'}.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'isim': {
                const newName = interaction.options.getString('isim');
                const oldName = channel.name;
                await channel.setName(newName);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Kanal İsmi Değiştirildi')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'Eski İsim', value: oldName },
                        { name: 'Yeni İsim', value: newName }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 