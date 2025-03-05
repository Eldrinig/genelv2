const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rulet')
        .setDescription('Rus ruleti oyunu')
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
                flags: ['Ephemeral']
            });
        }

        // Bot ile oynamaya çalışıyorsa
        if (opponent.bot) {
            return interaction.reply({
                content: 'Botlar ile oynayamazsın!',
                flags: ['Ephemeral']
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Rus Ruleti')
            .setDescription(`${opponent}, ${interaction.user} seninle rus ruleti oynamak istiyor!\n\n**Nasıl Oynanır?**\nSırayla tetik çekilir. Mermi kimin sırasında gelirse o oyuncu kaybeder!\n\n**İpucu:** /şans komutunu kullanarak hayatta kalma şansını arttırabilirsin!`)
            .setColor('#ff0000')
            .setFooter({ text: '6 mermiden sadece 1 tanesi dolu!' })
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGY4YzY0ZTFkZWM4ZjZhOWRmNWZjYzM0ZDc4ZDM4ZTJmZDI1NzNiZCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/26uf7yd2KyKFgwWDS/giphy.gif');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`rulet_accept_${interaction.user.id}_${opponent.id}`)
                    .setLabel('Kabul Et')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`rulet_reject_${interaction.user.id}_${opponent.id}`)
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
