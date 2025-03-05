const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FF0000';
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Belirtilen üyeyi sunucudan yasaklar')
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Yasaklanacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('sebep')
                .setDescription('Yasaklama sebebi')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName('sessiz')
                .setDescription('Yasaklama işlemini gizli tutar')
                .setRequired(false)),

    async execute(interaction) {
        // Yetki kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const noPermEmbed = new EmbedBuilder()
                .setTitle('❌ Yetersiz Yetki')
                .setDescription('```diff\n- Bu komutu kullanmak için Üyeleri Yasakla yetkisine sahip olmalısınız.\n```')
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        const user = interaction.options.getUser('kullanıcı');
        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
        const silent = interaction.options.getBoolean('sessiz') || false;
        const member = interaction.guild.members.cache.get(user.id);

        // Yetki kontrolleri
        if (member) {
            if (member.roles.highest.position >= interaction.member.roles.highest.position) {
                const hierarchyEmbed = new EmbedBuilder()
                    .setTitle('❌ Yetki Hatası')
                    .setDescription('```diff\n- Bu kullanıcıyı yasaklayamazsınız çünkü sizinle aynı veya daha yüksek bir role sahip.\n```')
                    .setColor(BRAND_COLOR)
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .setTimestamp();

                return interaction.reply({ embeds: [hierarchyEmbed], ephemeral: true });
            }
        }

        const banEmbed = new EmbedBuilder()
            .setTitle('🔨 Kullanıcı Yasaklandı')
            .setDescription(`
\`\`\`diff
+ Kullanıcı başarıyla yasaklandı
- Sunucudan uzaklaştırıldı\`\`\`

**Yasaklanan Kullanıcı**
> 👤 ${user.tag}
> 🆔 ${user.id}

**Yasaklama Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> 📝 Sebep: ${reason}
> ⏰ Tarih: <t:${Math.floor(Date.now() / 1000)}:F>`)
            .setColor(BRAND_COLOR)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
            .setTimestamp();

        try {
            await interaction.guild.members.ban(user, { reason: reason });
            
            // DM Bildirimi
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🔨 Yasaklama Bildirimi')
                    .setDescription(`
\`\`\`diff
- ${interaction.guild.name} sunucusundan yasaklandınız
\`\`\`

**Yasaklama Detayları**
> 👮 Yetkili: ${interaction.user.tag}
> 📝 Sebep: ${reason}
> ⏰ Tarih: <t:${Math.floor(Date.now() / 1000)}:F>`)
                    .setColor(BRAND_COLOR)
                    .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                // DM gönderilemezse sessizce devam et
            }

            await interaction.reply({ embeds: [banEmbed], ephemeral: silent });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Hata')
                .setDescription(`\`\`\`diff\n- Yasaklama işlemi başarısız: ${error.message}\n\`\`\``)
                .setColor(BRAND_COLOR)
                .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON })
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}; 