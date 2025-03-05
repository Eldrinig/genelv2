const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { supportCategoryId, supportRoleId, ticketTypes } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('destek-kur')
        .setDescription('Destek talebi sistemini kurar')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Yönetici veya sunucu sahibi kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator) && 
            interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız!',
                ephemeral: true
            });
        }

        // Gerekli ayarların kontrolü
        const config = require('../../config.json');
        if (!config.supportCategoryId || !config.supportRoleId || !config.transcriptChannelId) {
            return interaction.reply({
                content: 'Lütfen önce `/destek-ayarla` komutu ile gerekli ayarları yapın!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Talebi Sistemi')
            .setDescription('Aşağıdaki menüden destek kategorisini seçin ve talep oluşturun.')
            .setColor('#0099ff');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_category')
            .setPlaceholder('Kategori seçin')
            .addOptions(
                ticketTypes.map(type => ({
                    label: type.label,
                    emoji: type.emoji,
                    value: type.value,
                    description: `${type.label} için destek talebi oluştur`
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: 'Destek talebi sistemi başarıyla kuruldu!',
            ephemeral: true
        });
    }
}; 