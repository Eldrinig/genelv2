const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/prefixes.json')) {
    fs.writeFileSync('./data/prefixes.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Sunucu için özel prefix ayarlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ayarla')
                .setDescription('Yeni prefix ayarlar')
                .addStringOption(option =>
                    option
                        .setName('prefix')
                        .setDescription('Yeni prefix')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(5)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sıfırla')
                .setDescription('Prefixi varsayılana sıfırlar')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const prefixes = JSON.parse(fs.readFileSync('./data/prefixes.json', 'utf-8'));

        switch (subcommand) {
            case 'ayarla': {
                const newPrefix = interaction.options.getString('prefix');
                prefixes[interaction.guild.id] = newPrefix;

                fs.writeFileSync('./data/prefixes.json', JSON.stringify(prefixes, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('✅ Prefix Değiştirildi')
                    .setColor('#00ff00')
                    .setDescription(`Yeni prefix: \`${newPrefix}\``)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'sıfırla': {
                delete prefixes[interaction.guild.id];
                fs.writeFileSync('./data/prefixes.json', JSON.stringify(prefixes, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('🔄 Prefix Sıfırlandı')
                    .setColor('#0099ff')
                    .setDescription('Prefix varsayılan değere döndürüldü: `/`')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 