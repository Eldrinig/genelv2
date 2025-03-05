const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('butonrol')
        .setDescription('Buton rol sistemini ayarlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription('Verilecek rol')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('başlık')
                .setDescription('Buton mesajının başlığı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('açıklama')
                .setDescription('Buton mesajının açıklaması')
                .setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole('rol');
        const title = interaction.options.getString('başlık');
        const description = interaction.options.getString('açıklama');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#0099ff');

        const button = new ButtonBuilder()
            .setCustomId(`role_${role.id}`)
            .setLabel(`${role.name} Rol`)
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: 'Buton rol sistemi başarıyla kuruldu!',
            ephemeral: true
        });
    }
}; 