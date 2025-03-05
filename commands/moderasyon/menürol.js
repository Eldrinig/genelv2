const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/menu-roles.json')) {
    fs.writeFileSync('./data/menu-roles.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('menürol')
        .setDescription('Menü rol sistemini yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('oluştur')
                .setDescription('Yeni rol menüsü oluşturur')
                .addStringOption(option =>
                    option
                        .setName('başlık')
                        .setDescription('Menü başlığı')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('açıklama')
                        .setDescription('Menü açıklaması')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rol-ekle')
                .setDescription('Menüye rol ekler')
                .addStringOption(option =>
                    option
                        .setName('menü-id')
                        .setDescription('Rol eklenecek menünün ID\'si')
                        .setRequired(true))
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Eklenecek rol')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('açıklama')
                        .setDescription('Rol açıklaması')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Rol emojisi')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const menuRoles = JSON.parse(fs.readFileSync('./data/menu-roles.json', 'utf-8'));

        if (!menuRoles[interaction.guild.id]) {
            menuRoles[interaction.guild.id] = {};
        }

        switch (subcommand) {
            case 'oluştur': {
                const title = interaction.options.getString('başlık');
                const description = interaction.options.getString('açıklama');

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor('#0099ff');

                const menu = new StringSelectMenuBuilder()
                    .setCustomId(`roles_${Date.now()}`)
                    .setPlaceholder('Rol seçin')
                    .setMinValues(0)
                    .setMaxValues(1);

                const row = new ActionRowBuilder().addComponents(menu);

                const message = await interaction.channel.send({
                    embeds: [embed],
                    components: [row]
                });

                menuRoles[interaction.guild.id][message.id] = {
                    roles: [],
                    messageId: message.id,
                    channelId: message.channel.id
                };

                fs.writeFileSync('./data/menu-roles.json', JSON.stringify(menuRoles, null, 2));

                await interaction.reply({
                    content: `Menü oluşturuldu! Menü ID: ${message.id}`,
                    ephemeral: true
                });
                break;
            }

            case 'rol-ekle': {
                const menuId = interaction.options.getString('menü-id');
                const role = interaction.options.getRole('rol');
                const description = interaction.options.getString('açıklama');
                const emoji = interaction.options.getString('emoji');

                if (!menuRoles[interaction.guild.id][menuId]) {
                    return interaction.reply({
                        content: 'Belirtilen ID\'ye sahip bir menü bulunamadı!',
                        ephemeral: true
                    });
                }

                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({
                        content: 'Bu rolü veremem çünkü benim rolümden daha yüksek!',
                        ephemeral: true
                    });
                }

                const menu = menuRoles[interaction.guild.id][menuId];
                menu.roles.push({
                    roleId: role.id,
                    description: description,
                    emoji: emoji
                });

                const channel = await interaction.guild.channels.fetch(menu.channelId);
                const message = await channel.messages.fetch(menu.messageId);

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`roles_${menuId}`)
                    .setPlaceholder('Rol seçin')
                    .setMinValues(0)
                    .setMaxValues(1)
                    .addOptions(
                        menu.roles.map(r => ({
                            label: interaction.guild.roles.cache.get(r.roleId).name,
                            description: r.description,
                            value: r.roleId,
                            emoji: r.emoji
                        }))
                    );

                const row = new ActionRowBuilder().addComponents(selectMenu);

                await message.edit({ components: [row] });
                fs.writeFileSync('./data/menu-roles.json', JSON.stringify(menuRoles, null, 2));

                await interaction.reply({
                    content: `${role.name} rolü menüye eklendi!`,
                    ephemeral: true
                });
                break;
            }
        }
    }
}; 