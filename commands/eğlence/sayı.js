const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sayı')
        .setDescription('Sayı tahmin oyunu')
        .addUserOption(option =>
            option
                .setName('rakip')
                .setDescription('Oynamak istediğin rakip')
                .setRequired(true)),

    async execute(interaction) {
        const opponent = interaction.options.getUser('rakip');
        
        if (opponent.id === interaction.user.id) {
            return interaction.reply({
                content: 'Kendinle oynayamazsın!',
                flags: ['Ephemeral']
            });
        }

        if (opponent.bot) {
            return interaction.reply({
                content: 'Botlar ile oynayamazsın!',
                flags: ['Ephemeral']
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🔢 Sayı Tahmin')
            .setDescription(`${opponent}, ${interaction.user} seninle sayı tahmin yarışı oynamak istiyor!\n\nOyun Kuralları:\n- Her oyuncuya 5 tahmin hakkı verilir\n- 1-100 arası bir sayı tahmin edilecek\n- En yakın tahmini yapan kazanır`)
            .setColor('#00ff00')
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjE4Y2JhZTEyYTBmZDFhZjE1ZmZjYTYxMzQ0ZjM0ODM2NjI0MjE2ZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o7btPCcdNniyf0ArS/giphy.gif');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`sayı_accept_${interaction.user.id}_${opponent.id}`)
                    .setLabel('Kabul Et')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`sayı_reject_${interaction.user.id}_${opponent.id}`)
                    .setLabel('Reddet')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({
            content: `${opponent}`,
            embeds: [embed],
            components: [row]
        });
    }
};
