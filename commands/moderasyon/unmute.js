const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#00FF00';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('🔊 Kullanıcının susturmasını kaldırır')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Susturması kaldırılacak kullanıcı')
                .setRequired(true))
        .addBooleanOption(option =>
            option
                .setName('sessiz')
                .setDescription('İşlemi gizli tutar')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const silent = interaction.options.getBoolean('sessiz') || false;
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            const notFoundEmbed = new EmbedBuilder()
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription('```diff\n- Bu kullanıcı sunucuda bulunmuyor.\n```')
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
        }

        if (!member.isCommunicationDisabled()) {
            const notMutedEmbed = new EmbedBuilder()
                .setTitle('❌ Susturma Bulunamadı')
                .setDescription('```diff\n- Bu kullanıcı zaten susturulmamış.\n```')
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [notMutedEmbed], ephemeral: true });
        }

        try {
            await member.timeout(null);

            const unmuteEmbed = new EmbedBuilder()
                .setTitle('🔊 Susturma Kaldırıldı')
                .setDescription(`
\`\`\`diff
+ Kullanıcının susturması başarıyla kaldırıldı
- Sohbet erişimi tekrar açıldı\`\`\`

**Kullanıcı Bilgileri**
> 👤 ${user.tag}
> 🆔 ${user.id}

**İşlem Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> ⏰ Tarih: <t:${Math.floor(Date.now() / 1000)}:F>`)
                .setColor(BRAND_COLOR)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            // DM Bildirimi
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔊 Susturma Kaldırıldı')
                    .setDescription(`
\`\`\`diff
+ ${interaction.guild.name} sunucusunda susturmanız kaldırıldı
\`\`\`

**İşlem Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> ⏰ Tarih: <t:${Math.floor(Date.now() / 1000)}:F>

*Artık sunucuda tekrar konuşabilirsiniz.*`)
                    .setColor(BRAND_COLOR)
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // DM gönderilemezse sessizce devam et
            }

            await interaction.reply({ embeds: [unmuteEmbed], ephemeral: silent });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Hata')
                .setDescription(`\`\`\`diff\n- Susturma kaldırma işlemi başarısız: ${error.message}\n\`\`\``)
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 