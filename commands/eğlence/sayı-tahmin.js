const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const activeGames = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sayı-tahmin')
        .setDescription('Sayı tahmin oyunu')
        .addSubcommand(subcommand =>
            subcommand
                .setName('başlat')
                .setDescription('Yeni oyun başlatır'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('tahmin')
                .setDescription('Tahminde bulun')
                .addIntegerOption(option =>
                    option
                        .setName('sayı')
                        .setDescription('Tahmin ettiğin sayı (1-100)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'başlat') {
            if (activeGames.has(interaction.user.id)) {
                return interaction.reply({
                    content: 'Zaten devam eden bir oyunun var!',
                    ephemeral: true
                });
            }

            const number = Math.floor(Math.random() * 100) + 1;
            activeGames.set(interaction.user.id, {
                number,
                attempts: 0
            });

            const embed = new EmbedBuilder()
                .setTitle('🎮 Sayı Tahmin Oyunu')
                .setDescription('1 ile 100 arasında bir sayı tuttum.\nTahmin etmek için `/sayı-tahmin tahmin` komutunu kullan!')
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'tahmin') {
            const game = activeGames.get(interaction.user.id);
            if (!game) {
                return interaction.reply({
                    content: 'Aktif bir oyunun yok! `/sayı-tahmin başlat` ile yeni oyun başlat.',
                    ephemeral: true
                });
            }

            const guess = interaction.options.getInteger('sayı');
            game.attempts++;

            if (guess === game.number) {
                activeGames.delete(interaction.user.id);
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Tebrikler!')
                    .setDescription(`Doğru tahmin! Sayı ${game.number} idi.\n${game.attempts} denemede bildin!`)
                    .setColor('#00ff00')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                const hint = guess > game.number ? 'Daha küçük bir sayı söyle!' : 'Daha büyük bir sayı söyle!';
                const embed = new EmbedBuilder()
                    .setTitle('❌ Yanlış Tahmin')
                    .setDescription(`${hint}\nDeneme sayısı: ${game.attempts}`)
                    .setColor('#ff0000')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        }
    }
}; 