const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FF9900';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👢 Belirtilen üyeyi sunucudan atar')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Atılacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('sebep')
                .setDescription('Atılma sebebi')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('sessiz')
                .setDescription('Atma işlemini gizli tutar')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
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

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            const hierarchyEmbed = new EmbedBuilder()
                .setTitle('❌ Yetki Hatası')
                .setDescription('```diff\n- Bu kullanıcıyı atamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip.\n```')
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [hierarchyEmbed], ephemeral: true });
        }

        const kickEmbed = new EmbedBuilder()
            .setTitle('👢 Kullanıcı Atıldı')
            .setDescription(`
\`\`\`diff
+ Kullanıcı başarıyla atıldı
- Sunucudan uzaklaştırıldı\`\`\`

**Atılan Kullanıcı**
> 👤 ${user.tag}
> 🆔 ${user.id}

**İşlem Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> 📝 Sebep: ${reason}
> ⏰ Tarih: <t:${Math.floor(Date.now() / 1000)}:F>`)
            .setColor(BRAND_COLOR)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        try {
            // DM Bildirimi
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('👢 Atılma Bildirimi')
                    .setDescription(`
\`\`\`diff
- ${interaction.guild.name} sunucusundan atıldınız
\`\`\`

**İşlem Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> 📝 Sebep: ${reason}
> ⏰ Tarih: <t:${Math.floor(Date.now() / 1000)}:F>

*Not: Sunucuya tekrar katılabilirsiniz.*`)
                    .setColor(BRAND_COLOR)
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // DM gönderilemezse sessizce devam et
            }

            await member.kick(reason);
            await interaction.reply({ embeds: [kickEmbed], ephemeral: silent });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Hata')
                .setDescription(`\`\`\`diff\n- Atma işlemi başarısız: ${error.message}\n\`\`\``)
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 