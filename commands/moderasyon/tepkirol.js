const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/reaction-roles.json')) {
    fs.writeFileSync('./data/reaction-roles.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tepkirol')
        .setDescription('Tepki rol sistemini yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Yeni tepki rol ekler')
                .addRoleOption(option =>
                    option
                        .setName('rol')
                        .setDescription('Verilecek rol')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Tepki emojisi')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('başlık')
                        .setDescription('Mesaj başlığı')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('açıklama')
                        .setDescription('Mesaj açıklaması')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Tepki rolleri listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const reactionRoles = JSON.parse(fs.readFileSync('./data/reaction-roles.json', 'utf-8'));

        if (!reactionRoles[interaction.guild.id]) {
            reactionRoles[interaction.guild.id] = [];
        }

        switch (subcommand) {
            case 'ekle': {
                const role = interaction.options.getRole('rol');
                const emoji = interaction.options.getString('emoji');
                const title = interaction.options.getString('başlık');
                const description = interaction.options.getString('açıklama');

                if (role.position >= interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({
                        content: 'Bu rolü veremem çünkü benim rolümden daha yüksek!',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(description)
                    .setColor('#0099ff')
                    .addFields(
                        { name: 'Rol', value: role.toString() },
                        { name: 'Emoji', value: emoji }
                    );

                const message = await interaction.channel.send({ embeds: [embed] });
                await message.react(emoji);

                reactionRoles[interaction.guild.id].push({
                    messageId: message.id,
                    roleId: role.id,
                    emoji: emoji
                });

                fs.writeFileSync('./data/reaction-roles.json', JSON.stringify(reactionRoles, null, 2));

                await interaction.reply({
                    content: 'Tepki rol sistemi başarıyla oluşturuldu!',
                    ephemeral: true
                });
                break;
            }

            case 'liste': {
                if (reactionRoles[interaction.guild.id].length === 0) {
                    return interaction.reply({
                        content: 'Hiç tepki rol bulunmuyor.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📋 Tepki Roller')
                    .setColor('#0099ff')
                    .setDescription(
                        reactionRoles[interaction.guild.id]
                            .map((rr, index) => {
                                const role = interaction.guild.roles.cache.get(rr.roleId);
                                return `${index + 1}. ${rr.emoji} = ${role ? role.toString() : 'Silinmiş rol'}`;
                            })
                            .join('\n')
                    );

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 