const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isim-düzeltme')
        .setDescription('Uygunsuz kullanıcı isimlerini düzeltir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('İsmi düzeltilecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('yeni-isim')
                .setDescription('Yeni isim')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const newNickname = interaction.options.getString('yeni-isim');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({
                content: 'Bu kullanıcı sunucuda bulunmuyor.',
                ephemeral: true
            });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({
                content: 'Bu kullanıcının ismini değiştiremezsiniz çünkü sizinle aynı veya daha yüksek bir role sahip.',
                ephemeral: true
            });
        }

        try {
            const oldNickname = member.nickname || member.user.username;
            await member.setNickname(newNickname);

            const embed = new EmbedBuilder()
                .setTitle('✏️ Kullanıcı İsmi Değiştirildi')
                .setColor('#00ff00')
                .addFields(
                    { name: 'Kullanıcı', value: `${user.tag} (${user.id})` },
                    { name: 'Eski İsim', value: oldNickname },
                    { name: 'Yeni İsim', value: newNickname },
                    { name: 'Değiştiren Yetkili', value: interaction.user.tag }
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