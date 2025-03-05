const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/autorole.json')) {
    fs.writeFileSync('./data/autorole.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otorol')
        .setDescription('Yeni üyelere otomatik verilecek rolü ayarlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ayarla')
                .setDescription('Otorol ayarlar')
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Verilecek rol')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kapat')
                .setDescription('Otorol sistemini kapatır')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const autoroles = JSON.parse(fs.readFileSync('./data/autorole.json', 'utf-8'));

        switch (subcommand) {
            case 'ayarla': {
                const role = interaction.options.getRole('rol');

                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({
                        content: 'Bu rolü veremem çünkü benim rolümden daha yüksek!',
                        ephemeral: true
                    });
                }

                autoroles[interaction.guild.id] = role.id;
                fs.writeFileSync('./data/autorole.json', JSON.stringify(autoroles, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('✅ Otorol Ayarlandı')
                    .setColor('#00ff00')
                    .setDescription(`Yeni üyelere otomatik olarak ${role} rolü verilecek.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'kapat': {
                delete autoroles[interaction.guild.id];
                fs.writeFileSync('./data/autorole.json', JSON.stringify(autoroles, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('❌ Otorol Kapatıldı')
                    .setColor('#ff0000')
                    .setDescription('Otorol sistemi kapatıldı.')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 