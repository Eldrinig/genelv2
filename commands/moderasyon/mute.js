const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FF9900';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

// Süre formatları için yardımcı fonksiyon
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün`;
    if (hours > 0) return `${hours} saat`;
    if (minutes > 0) return `${minutes} dakika`;
    return `${seconds} saniye`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('🔇 Belirtilen üyeyi susturur')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Susturulacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('süre')
                .setDescription('Susturma süresi (1m, 1h, 1d)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('sebep')
                .setDescription('Susturma sebebi')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('sessiz')
                .setDescription('Susturma işlemini gizli tutar')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const duration = interaction.options.getString('süre');
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

        const milliseconds = ms(duration);
        if (!milliseconds || milliseconds < 0 || milliseconds > 2419200000) {
            const invalidDurationEmbed = new EmbedBuilder()
                .setTitle('❌ Geçersiz Süre')
                .setDescription(`
\`\`\`diff
- Geçersiz süre formatı
+ Doğru format örnekleri:
\`\`\`
> 🕐 **Dakika:** \`1m, 5m, 30m\`
> 🕑 **Saat:** \`1h, 12h, 24h\`
> 📅 **Gün:** \`1d, 7d, 28d\`

*Not: Maksimum susturma süresi 28 gündür.*`)
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [invalidDurationEmbed], ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            const hierarchyEmbed = new EmbedBuilder()
                .setTitle('❌ Yetki Hatası')
                .setDescription('```diff\n- Bu kullanıcıyı susturamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip.\n```')
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [hierarchyEmbed], ephemeral: true });
        }

        const muteEmbed = new EmbedBuilder()
            .setTitle('🔇 Kullanıcı Susturuldu')
            .setDescription(`
\`\`\`diff
+ Kullanıcı başarıyla susturuldu
- Sohbet erişimi kısıtlandı\`\`\`

**Susturulan Kullanıcı**
> 👤 ${user.tag}
> 🆔 ${user.id}

**İşlem Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> ⏰ Süre: ${formatDuration(milliseconds)}
> 📝 Sebep: ${reason}
> 🕒 Bitiş: <t:${Math.floor((Date.now() + milliseconds) / 1000)}:R>`)
            .setColor(BRAND_COLOR)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        try {
            // DM Bildirimi
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔇 Susturulma Bildirimi')
                    .setDescription(`
\`\`\`diff
- ${interaction.guild.name} sunucusunda susturuldunuz
\`\`\`

**İşlem Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> ⏰ Süre: ${formatDuration(milliseconds)}
> 📝 Sebep: ${reason}
> 🕒 Bitiş: <t:${Math.floor((Date.now() + milliseconds) / 1000)}:R>`)
                    .setColor(BRAND_COLOR)
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // DM gönderilemezse sessizce devam et
            }

            await member.timeout(milliseconds, reason);
            await interaction.reply({ embeds: [muteEmbed], ephemeral: silent });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Hata')
                .setDescription(`\`\`\`diff\n- Susturma işlemi başarısız: ${error.message}\n\`\`\``)
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 