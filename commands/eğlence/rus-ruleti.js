const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const activeGames = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rus-ruleti')
        .setDescription('Rus ruleti oynar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('başlat')
                .setDescription('Yeni oyun başlatır'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ateş')
                .setDescription('Tetiği çeker')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'başlat') {
            if (activeGames.has(interaction.user.id)) {
                return interaction.reply({
                    content: 'Zaten devam eden bir oyunun var!',
                    ephemeral: true
                });
            }

            const bullet = Math.floor(Math.random() * 6);
            activeGames.set(interaction.user.id, {
                bullet,
                currentChamber: 0
            });

            const embed = new EmbedBuilder()
                .setTitle('🔫 Rus Ruleti')
                .setDescription('Revolver hazırlandı. Tetiği çekmek için `/rus-ruleti ateş` komutunu kullan!')
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'ateş') {
            const game = activeGames.get(interaction.user.id);
            if (!game) {
                return interaction.reply({
                    content: 'Aktif bir oyunun yok! `/rus-ruleti başlat` ile yeni oyun başlat.',
                    ephemeral: true
                });
            }

            const isDead = game.currentChamber === game.bullet;
            const embed = new EmbedBuilder()
                .setTitle('🔫 Rus Ruleti')
                .setDescription(isDead ? '💥 **BAM!** Kaybettin!' : '😅 *klik* Şanslısın, hayatta kaldın!')
                .setColor(isDead ? '#ff0000' : '#00ff00')
                .addFields(
                    { name: 'Şans', value: `${5 - game.currentChamber}/6`, inline: true }
                )
                .setTimestamp();

            if (isDead || game.currentChamber === 5) {
                activeGames.delete(interaction.user.id);
                embed.setFooter({ text: 'Oyun bitti!' });
            } else {
                game.currentChamber++;
            }

            await interaction.reply({ embeds: [embed] });
        }
    }
}; 