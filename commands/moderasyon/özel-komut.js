const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/custom-commands.json')) {
    fs.writeFileSync('./data/custom-commands.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('özel-komut')
        .setDescription('Özel komut sistemini yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Yeni özel komut ekler')
                .addStringOption(option =>
                    option
                        .setName('komut')
                        .setDescription('Komut adı')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('yanıt')
                        .setDescription('Komut yanıtı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sil')
                .setDescription('Özel komutu siler')
                .addStringOption(option =>
                    option
                        .setName('komut')
                        .setDescription('Silinecek komut')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Özel komutları listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const customCommands = JSON.parse(fs.readFileSync('./data/custom-commands.json', 'utf-8'));

        if (!customCommands[interaction.guild.id]) {
            customCommands[interaction.guild.id] = {};
        }

        switch (subcommand) {
            case 'ekle': {
                const command = interaction.options.getString('komut').toLowerCase();
                const response = interaction.options.getString('yanıt');

                if (customCommands[interaction.guild.id][command]) {
                    return interaction.reply({
                        content: 'Bu komut zaten mevcut!',
                        ephemeral: true
                    });
                }

                customCommands[interaction.guild.id][command] = response;
                fs.writeFileSync('./data/custom-commands.json', JSON.stringify(customCommands, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('✅ Özel Komut Eklendi')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'Komut', value: command },
                        { name: 'Yanıt', value: response }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'sil': {
                const command = interaction.options.getString('komut').toLowerCase();

                if (!customCommands[interaction.guild.id][command]) {
                    return interaction.reply({
                        content: 'Böyle bir komut bulunamadı!',
                        ephemeral: true
                    });
                }

                delete customCommands[interaction.guild.id][command];
                fs.writeFileSync('./data/custom-commands.json', JSON.stringify(customCommands, null, 2));

                await interaction.reply({
                    content: `\`${command}\` komutu silindi.`,
                    ephemeral: true
                });
                break;
            }

            case 'liste': {
                const commands = Object.entries(customCommands[interaction.guild.id]);

                if (commands.length === 0) {
                    return interaction.reply({
                        content: 'Hiç özel komut bulunmuyor.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle('📋 Özel Komutlar')
                    .setColor('#0099ff')
                    .setDescription(
                        commands
                            .map(([cmd, response], index) => 
                                `${index + 1}. \`${cmd}\` → ${response.length > 100 ? response.substring(0, 97) + '...' : response}`)
                            .join('\n')
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 