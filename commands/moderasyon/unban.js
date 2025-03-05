const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Kullanıcının yasağını kaldırır')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('Yasağı kaldırılacak kullanıcının ID\'si')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.options.getString('id');

        try {
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return interaction.reply({
                    content: 'Bu kullanıcı yasaklı listesinde bulunmuyor.',
                    ephemeral: true
                });
            }

            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setTitle('🔓 Yasak Kaldırıldı')
                .setColor('#00ff00')
                .addFields(
                    { name: 'Kullanıcı', value: `${bannedUser.user.tag} (${bannedUser.user.id})` },
                    { name: 'Yetkili', value: interaction.user.tag }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: `Bir hata oluştu: ${error.message}`,
                ephemeral: true
            });
        }
    }
}; 