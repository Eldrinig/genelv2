const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tkm')
        .setDescription('Taş kağıt makas oyunu')
        .addUserOption(option =>
            option
                .setName('rakip')
                .setDescription('Oynamak istediğin rakip')
                .setRequired(true)),

    async execute(interaction) {
        const opponent = interaction.options.getUser('rakip');
        
        // Kendisiyle oynamaya çalışıyorsa
        if (opponent.id === interaction.user.id) {
            return interaction.reply({
                content: 'Kendinle oynayamazsın!',
                ephemeral: true
            });
        }

        // Bot ile oynamaya çalışıyorsa
        if (opponent.bot) {
            return interaction.reply({
                content: 'Botlar ile oynayamazsın!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('✌️ Taş Kağıt Makas')
            .setDescription(`${opponent}, ${interaction.user} seninle taş kağıt makas oynamak istiyor!`)
            .setColor('#00ff00')
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjRlNzNhNmRhOTVjNjY5ZmVmOGNmZjJhZmZiODM4ZjY4NTJlZTc2ZiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3ohzdGnD3j2vK3XNHa/giphy.gif');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`tkm_accept_${interaction.user.id}_${opponent.id}`)
                    .setLabel('Kabul Et')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`tkm_reject_${interaction.user.id}_${opponent.id}`)
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
