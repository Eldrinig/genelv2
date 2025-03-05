const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const words = [
    'programlama', 'bilgisayar', 'internet', 'yazılım', 'donanım',
    'algoritma', 'veritabanı', 'sunucu', 'klavye', 'fare',
    'ekran', 'bellek', 'işlemci', 'ağ', 'güvenlik',
    'uygulama', 'sistem', 'dosya', 'klasör', 'pencere'
];

const activeGames = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kelime-oyunu')
        .setDescription('Kelime tahmin oyunu')
        .addSubcommand(subcommand =>
            subcommand
                .setName('başlat')
                .setDescription('Yeni oyun başlatır'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('tahmin')
                .setDescription('Tahminde bulun')
                .addStringOption(option =>
                    option
                        .setName('harf')
                        .setDescription('Tahmin ettiğin harf')
                        .setRequired(true)
                        .setMaxLength(1))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'başlat') {
            if (activeGames.has(interaction.user.id)) {
                return interaction.reply({
                    content: 'Zaten devam eden bir oyunun var!',
                    ephemeral: true
                });
            }

            const word = words[Math.floor(Math.random() * words.length)];
            activeGames.set(interaction.user.id, {
                word,
                guessed: new Set(),
                attempts: 0,
                maxAttempts: 6
            });

            const embed = new EmbedBuilder()
                .setTitle('🎯 Kelime Oyunu')
                .setDescription(`Kelimeyi tahmin et!\n\n${getDisplayWord(word, new Set())}\n\nTahmin için \`/kelime-oyunu tahmin\` komutunu kullan!`)
                .addFields(
                    { name: 'Kalan Hak', value: '6/6', inline: true },
                    { name: 'Tahmin Edilen Harfler', value: 'Yok', inline: true }
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'tahmin') {
            const game = activeGames.get(interaction.user.id);
            if (!game) {
                return interaction.reply({
                    content: 'Aktif bir oyunun yok! `/kelime-oyunu başlat` ile yeni oyun başlat.',
                    ephemeral: true
                });
            }

            const guess = interaction.options.getString('harf').toLowerCase();
            if (game.guessed.has(guess)) {
                return interaction.reply({
                    content: 'Bu harfi zaten tahmin ettin!',
                    ephemeral: true
                });
            }

            game.guessed.add(guess);
            if (!game.word.includes(guess)) {
                game.attempts++;
            }

            const displayWord = getDisplayWord(game.word, game.guessed);
            const isWon = !displayWord.includes('_');
            const isLost = game.attempts >= game.maxAttempts;

            const embed = new EmbedBuilder()
                .setTitle('🎯 Kelime Oyunu')
                .setDescription(`${displayWord}`)
                .addFields(
                    { name: 'Kalan Hak', value: `${game.maxAttempts - game.attempts}/${game.maxAttempts}`, inline: true },
                    { name: 'Tahmin Edilen Harfler', value: Array.from(game.guessed).join(', '), inline: true }
                )
                .setTimestamp();

            if (isWon) {
                embed.setColor('#00ff00')
                    .setDescription(`🎉 Tebrikler! Kelimeyi buldun: **${game.word}**`);
                activeGames.delete(interaction.user.id);
            } else if (isLost) {
                embed.setColor('#ff0000')
                    .setDescription(`😢 Kaybettin! Doğru kelime: **${game.word}**`);
                activeGames.delete(interaction.user.id);
            } else {
                embed.setColor('#0099ff');
            }

            await interaction.reply({ embeds: [embed] });
        }
    }
};

function getDisplayWord(word, guessed) {
    return word
        .split('')
        .map(letter => guessed.has(letter) ? letter : '_')
        .join(' ');
} 