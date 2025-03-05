const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const QRCode = require('qrcode');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr-kod')
        .setDescription('QR kod oluşturur')
        .addStringOption(option =>
            option
                .setName('içerik')
                .setDescription('QR kodun içeriği')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const content = interaction.options.getString('içerik');

        try {
            const buffer = await QRCode.toBuffer(content);
            const attachment = new AttachmentBuilder(buffer, { name: 'qrcode.png' });

            const embed = new EmbedBuilder()
                .setTitle('🔲 QR Kod Oluşturuldu')
                .setImage('attachment://qrcode.png')
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            await interaction.editReply({
                content: 'QR kod oluşturulurken bir hata oluştu.',
                ephemeral: true
            });
        }
    }
}; 