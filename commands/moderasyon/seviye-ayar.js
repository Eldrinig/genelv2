const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seviye-ayar')
        .setDescription('Seviye sisteminin ayarlarını yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('kanal')
                .setDescription('Seviye atlama mesajlarının gönderileceği kanalı ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Mesajların gönderileceği kanal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('çarpan')
                .setDescription('XP kazanma çarpanını ayarlar')
                .addNumberOption(option =>
                    option
                        .setName('çarpan')
                        .setDescription('XP çarpanı (1-5 arası)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(5)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rol-ekle')
                .setDescription('Seviye ödül rolü ekler')
                .addIntegerOption(option =>
                    option
                        .setName('seviye')
                        .setDescription('Rolün verileceği seviye')
                        .setRequired(true)
                        .setMinValue(1))
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Verilecek rol')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const levels = JSON.parse(fs.readFileSync('./data/levels.json', 'utf-8'));

        if (!levels.settings[interaction.guild.id]) {
            levels.settings[interaction.guild.id] = {
                channel: null,
                multiplier: 1,
                roles: {}
            };
        }

        const settings = levels.settings[interaction.guild.id];

        switch (subcommand) {
            case 'kanal': {
                const channel = interaction.options.getChannel('kanal');
                settings.channel = channel.id;

                const embed = new EmbedBuilder()
                    .setTitle('✅ Seviye Kanalı Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`Seviye atlama mesajları artık ${channel} kanalına gönderilecek.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'çarpan': {
                const multiplier = interaction.options.getNumber('çarpan');
                settings.multiplier = multiplier;

                const embed = new EmbedBuilder()
                    .setTitle('✅ XP Çarpanı Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`XP kazanma çarpanı ${multiplier}x olarak ayarlandı.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'rol-ekle': {
                const level = interaction.options.getInteger('seviye');
                const role = interaction.options.getRole('rol');

                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({
                        content: 'Bu rolü veremem çünkü benim rolümden daha yüksek!',
                        ephemeral: true
                    });
                }

                settings.roles[level] = role.id;

                const embed = new EmbedBuilder()
                    .setTitle('✅ Seviye Rolü Eklendi')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'Seviye', value: level.toString() },
                        { name: 'Rol', value: role.toString() }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }

        fs.writeFileSync('./data/levels.json', JSON.stringify(levels, null, 2));
    }
}; 