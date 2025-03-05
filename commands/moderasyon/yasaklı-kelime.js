const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Yasaklı kelime verilerini saklamak için dosya kontrolü
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}
if (!fs.existsSync('./data/banned-words.json')) {
    fs.writeFileSync('./data/banned-words.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yasaklı-kelime')
        .setDescription('Yasaklı kelime sistemini yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Yasaklı kelime ekler')
                .addStringOption(option =>
                    option
                        .setName('kelime')
                        .setDescription('Yasaklanacak kelime')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kaldır')
                .setDescription('Yasaklı kelimeyi kaldırır')
                .addStringOption(option =>
                    option
                        .setName('kelime')
                        .setDescription('Kaldırılacak kelime')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Yasaklı kelimeleri listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const bannedWords = JSON.parse(fs.readFileSync('./data/banned-words.json', 'utf-8'));

        if (!bannedWords[interaction.guild.id]) {
            bannedWords[interaction.guild.id] = [];
        }

        switch (subcommand) {
            case 'ekle': {
                const word = interaction.options.getString('kelime').toLowerCase();
                
                if (bannedWords[interaction.guild.id].includes(word)) {
                    return interaction.reply({
                        content: 'Bu kelime zaten yasaklı listesinde!',
                        ephemeral: true
                    });
                }

                bannedWords[interaction.guild.id].push(word);
                fs.writeFileSync('./data/banned-words.json', JSON.stringify(bannedWords, null, 2));

                await interaction.reply({
                    content: `"${word}" kelimesi yasaklı listeye eklendi.`,
                    ephemeral: true
                });
                break;
            }

            case 'kaldır': {
                const word = interaction.options.getString('kelime').toLowerCase();
                const index = bannedWords[interaction.guild.id].indexOf(word);

                if (index === -1) {
                    return interaction.reply({
                        content: 'Bu kelime yasaklı listesinde bulunmuyor!',
                        ephemeral: true
                    });
                }

                bannedWords[interaction.guild.id].splice(index, 1);
                fs.writeFileSync('./data/banned-words.json', JSON.stringify(bannedWords, null, 2));

                await interaction.reply({
                    content: `"${word}" kelimesi yasaklı listeden kaldırıldı.`,
                    ephemeral: true
                });
                break;
            }

            case 'liste': {
                const embed = new EmbedBuilder()
                    .setTitle('📝 Yasaklı Kelimeler')
                    .setColor('#ff0000')
                    .setDescription(
                        bannedWords[interaction.guild.id].length > 0
                            ? bannedWords[interaction.guild.id].join(', ')
                            : 'Yasaklı kelime bulunmuyor.'
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