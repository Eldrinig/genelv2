const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/welcome-messages.json')) {
    fs.writeFileSync('./data/welcome-messages.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hoşgeldin-mesaj')
        .setDescription('Hoşgeldin mesajı sistemini ayarlar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ayarla')
                .setDescription('Hoşgeldin mesajını ayarlar')
                .addChannelOption(option =>
                    option
                        .setName('kanal')
                        .setDescription('Mesajın gönderileceği kanal')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('mesaj')
                        .setDescription('Hoşgeldin mesajı. {user}, {server}, {memberCount} kullanılabilir')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kapat')
                .setDescription('Hoşgeldin mesajı sistemini kapatır')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const welcomeMessages = JSON.parse(fs.readFileSync('./data/welcome-messages.json', 'utf-8'));

        switch (subcommand) {
            case 'ayarla': {
                const channel = interaction.options.getChannel('kanal');
                const message = interaction.options.getString('mesaj');

                welcomeMessages[interaction.guild.id] = {
                    channel: channel.id,
                    message: message
                };

                fs.writeFileSync('./data/welcome-messages.json', JSON.stringify(welcomeMessages, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('✅ Hoşgeldin Mesajı Ayarlandı')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'Kanal', value: channel.toString() },
                        { name: 'Mesaj', value: message }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'kapat': {
                delete welcomeMessages[interaction.guild.id];
                fs.writeFileSync('./data/welcome-messages.json', JSON.stringify(welcomeMessages, null, 2));

                const embed = new EmbedBuilder()
                    .setTitle('❌ Hoşgeldin Mesajı Kapatıldı')
                    .setColor('#ff0000')
                    .setDescription('Hoşgeldin mesajı sistemi kapatıldı.')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 