const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rol-ayar')
        .setDescription('Rol ayarlarını yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('renk')
                .setDescription('Rolün rengini değiştirir')
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Ayarlanacak rol')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('renk')
                        .setDescription('Yeni renk (HEX kodu)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('isim')
                .setDescription('Rolün ismini değiştirir')
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Ayarlanacak rol')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('isim')
                        .setDescription('Yeni rol ismi')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('simge')
                .setDescription('Rolün simgesini değiştirir')
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Ayarlanacak rol')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('simge')
                        .setDescription('Yeni simge (emoji)')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const role = interaction.options.getRole('rol');

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: 'Bu rolü düzenleyemem çünkü benim rolümden daha yüksek!',
                ephemeral: true
            });
        }

        switch (subcommand) {
            case 'renk': {
                const color = interaction.options.getString('renk');
                const colorRegex = /^#?[0-9A-Fa-f]{6}$/;

                if (!colorRegex.test(color)) {
                    return interaction.reply({
                        content: 'Geçerli bir HEX renk kodu girin! (Örnek: #FF0000)',
                        ephemeral: true
                    });
                }

                await role.setColor(color);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Rol Rengi Değiştirildi')
                    .setColor(color)
                    .setDescription(`${role} rolünün rengi değiştirildi.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'isim': {
                const newName = interaction.options.getString('isim');
                const oldName = role.name;
                await role.setName(newName);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Rol İsmi Değiştirildi')
                    .setColor(role.color)
                    .addFields(
                        { name: 'Eski İsim', value: oldName },
                        { name: 'Yeni İsim', value: newName }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'simge': {
                const icon = interaction.options.getString('simge');
                await role.setIcon(icon);

                const embed = new EmbedBuilder()
                    .setTitle('✅ Rol Simgesi Değiştirildi')
                    .setColor(role.color)
                    .setDescription(`${role} rolünün simgesi değiştirildi.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 