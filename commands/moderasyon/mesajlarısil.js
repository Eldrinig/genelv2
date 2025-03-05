const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mesajlarısil')
        .setDescription('Belirtilen sayıda mesajı siler')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName('miktar')
                .setDescription('Silinecek mesaj sayısı (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Sadece belirli bir kullanıcının mesajlarını sil')
                .setRequired(false)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('miktar');
        const user = interaction.options.getUser('kullanıcı');

        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            
            if (user) {
                const filteredMessages = messages.filter(m => m.author.id === user.id);
                await interaction.channel.bulkDelete(filteredMessages, true);
                await interaction.reply({
                    content: `${user.tag} kullanıcısına ait ${filteredMessages.size} mesaj silindi.`,
                    ephemeral: true
                });
            } else {
                await interaction.channel.bulkDelete(amount, true);
                await interaction.reply({
                    content: `${amount} mesaj silindi.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            await interaction.reply({
                content: '14 günden eski mesajlar silinemez.',
                ephemeral: true
            });
        }
    }
}; 