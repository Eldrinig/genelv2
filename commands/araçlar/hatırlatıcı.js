const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const reminders = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hatırlatıcı')
        .setDescription('Hatırlatıcı ayarlar')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Yeni hatırlatıcı ekler')
                .addStringOption(option =>
                    option
                        .setName('mesaj')
                        .setDescription('Hatırlatılacak mesaj')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName('dakika')
                        .setDescription('Kaç dakika sonra hatırlatılsın')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1440)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('listele')
                .setDescription('Aktif hatırlatıcıları listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'ekle') {
            const message = interaction.options.getString('mesaj');
            const minutes = interaction.options.getInteger('dakika');
            const userId = interaction.user.id;

            if (!reminders.has(userId)) {
                reminders.set(userId, []);
            }

            const reminder = {
                message,
                time: Date.now() + minutes * 60000,
                timeout: setTimeout(async () => {
                    const userReminders = reminders.get(userId);
                    const index = userReminders.findIndex(r => r.message === message);
                    if (index !== -1) {
                        userReminders.splice(index, 1);
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('⏰ Hatırlatıcı')
                        .setDescription(message)
                        .setColor('#ff9900')
                        .setTimestamp();

                    try {
                        await interaction.user.send({ embeds: [embed] });
                    } catch (error) {
                        // DM kapalıysa kanalda hatırlat
                        await interaction.channel.send({
                            content: `${interaction.user}`,
                            embeds: [embed]
                        });
                    }
                }, minutes * 60000)
            };

            reminders.get(userId).push(reminder);

            const embed = new EmbedBuilder()
                .setTitle('⏰ Hatırlatıcı Ayarlandı')
                .setDescription(`${minutes} dakika sonra "${message}" mesajı hatırlatılacak.`)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'listele') {
            const userReminders = reminders.get(interaction.user.id) || [];
            
            if (userReminders.length === 0) {
                return interaction.reply({
                    content: 'Aktif hatırlatıcın bulunmuyor.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📋 Aktif Hatırlatıcılar')
                .setDescription(
                    userReminders
                        .map((reminder, index) => {
                            const timeLeft = Math.ceil((reminder.time - Date.now()) / 60000);
                            return `${index + 1}. "${reminder.message}" - ${timeLeft} dakika kaldı`;
                        })
                        .join('\n')
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
}; 