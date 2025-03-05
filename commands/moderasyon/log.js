const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/logs.json')) {
    fs.writeFileSync('./data/logs.json', JSON.stringify({
        messageDelete: {},
        messageEdit: {},
        memberJoin: {},
        memberLeave: {},
        channelCreate: {},
        channelDelete: {},
        roleCreate: {},
        roleDelete: {},
        ban: {},
        unban: {}
    }));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Log kanallarını ayarlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('mesaj')
                .setDescription('Mesaj log kanalını ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Log kanalı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('üye')
                .setDescription('Üye log kanalını ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Log kanalı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sunucu')
                .setDescription('Sunucu log kanalını ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Log kanalı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Log ayarlarını listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const logs = JSON.parse(fs.readFileSync('./data/logs.json', 'utf-8'));

        if (subcommand === 'liste') {
            const embed = new EmbedBuilder()
                .setTitle('📝 Log Ayarları')
                .setColor('#0099ff')
                .addFields(
                    { 
                        name: 'Mesaj Logları',
                        value: logs.messageDelete[interaction.guild.id] 
                            ? `<#${logs.messageDelete[interaction.guild.id]}>` 
                            : 'Ayarlanmamış'
                    },
                    { 
                        name: 'Üye Logları',
                        value: logs.memberJoin[interaction.guild.id] 
                            ? `<#${logs.memberJoin[interaction.guild.id]}>` 
                            : 'Ayarlanmamış'
                    },
                    { 
                        name: 'Sunucu Logları',
                        value: logs.channelCreate[interaction.guild.id] 
                            ? `<#${logs.channelCreate[interaction.guild.id]}>` 
                            : 'Ayarlanmamış'
                    }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        const channel = interaction.options.getChannel('kanal');

        switch (subcommand) {
            case 'mesaj': {
                logs.messageDelete[interaction.guild.id] = channel.id;
                logs.messageEdit[interaction.guild.id] = channel.id;
                break;
            }
            case 'üye': {
                logs.memberJoin[interaction.guild.id] = channel.id;
                logs.memberLeave[interaction.guild.id] = channel.id;
                logs.ban[interaction.guild.id] = channel.id;
                logs.unban[interaction.guild.id] = channel.id;
                break;
            }
            case 'sunucu': {
                logs.channelCreate[interaction.guild.id] = channel.id;
                logs.channelDelete[interaction.guild.id] = channel.id;
                logs.roleCreate[interaction.guild.id] = channel.id;
                logs.roleDelete[interaction.guild.id] = channel.id;
                break;
            }
        }

        fs.writeFileSync('./data/logs.json', JSON.stringify(logs, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('✅ Log Kanalı Ayarlandı')
            .setColor('#00ff00')
            .setDescription(`${subcommand.charAt(0).toUpperCase() + subcommand.slice(1)} logları ${channel} kanalına gönderilecek.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 