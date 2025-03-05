const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/banned-channels.json')) {
    fs.writeFileSync('./data/banned-channels.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yasaklı-kanal')
        .setDescription('Kanal yasaklama sistemini yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Kanal yasaklar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Yasaklanacak kanal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kaldır')
                .setDescription('Kanal yasağını kaldırır')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Yasağı kaldırılacak kanal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Yasaklı kanalları listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const bannedChannels = JSON.parse(fs.readFileSync('./data/banned-channels.json', 'utf-8'));

        if (!bannedChannels[interaction.guild.id]) {
            bannedChannels[interaction.guild.id] = [];
        }

        switch (subcommand) {
            case 'ekle': {
                const channel = interaction.options.getChannel('kanal');
                
                if (bannedChannels[interaction.guild.id].includes(channel.id)) {
                    return interaction.reply({
                        content: 'Bu kanal zaten yasaklı listesinde!',
                        ephemeral: true
                    });
                }

                bannedChannels[interaction.guild.id].push(channel.id);
                fs.writeFileSync('./data/banned-channels.json', JSON.stringify(bannedChannels, null, 2));

                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: false
                });

                await interaction.reply({
                    content: `${channel} kanalı yasaklandı.`,
                    ephemeral: true
                });
                break;
            }

            case 'kaldır': {
                const channel = interaction.options.getChannel('kanal');
                const index = bannedChannels[interaction.guild.id].indexOf(channel.id);

                if (index === -1) {
                    return interaction.reply({
                        content: 'Bu kanal yasaklı listesinde bulunmuyor!',
                        ephemeral: true
                    });
                }

                bannedChannels[interaction.guild.id].splice(index, 1);
                fs.writeFileSync('./data/banned-channels.json', JSON.stringify(bannedChannels, null, 2));

                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: null
                });

                await interaction.reply({
                    content: `${channel} kanalının yasağı kaldırıldı.`,
                    ephemeral: true
                });
                break;
            }

            case 'liste': {
                const embed = new EmbedBuilder()
                    .setTitle('🚫 Yasaklı Kanallar')
                    .setColor('#ff0000')
                    .setDescription(
                        bannedChannels[interaction.guild.id].length > 0
                            ? bannedChannels[interaction.guild.id].map(id => `<#${id}>`).join('\n')
                            : 'Yasaklı kanal bulunmuyor.'
                    )
                    .setTimestamp();

                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
                break;
            }
        }
    }
}; 