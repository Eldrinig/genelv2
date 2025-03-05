const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uyarılar')
        .setDescription('Kullanıcının uyarılarını listeler')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Uyarıları listelenecek kullanıcı')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const warnings = JSON.parse(fs.readFileSync('./data/warnings.json', 'utf-8'));

        if (!warnings[interaction.guild.id] || !warnings[interaction.guild.id][user.id] || warnings[interaction.guild.id][user.id].length === 0) {
            return interaction.reply({
                content: `${user.tag} kullanıcısının hiç uyarısı bulunmuyor.`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚠️ ${user.tag} - Uyarı Listesi`)
            .setColor('#ffff00')
            .setDescription(
                warnings[interaction.guild.id][user.id]
                    .map((warning, index) => {
                        const moderator = interaction.client.users.cache.get(warning.moderator);
                        const date = new Date(warning.timestamp).toLocaleString();
                        return `**${index + 1}.** ${warning.reason}\n👮 Yetkili: ${moderator ? moderator.tag : 'Bilinmiyor'}\n📅 Tarih: ${date}`;
                    })
                    .join('\n\n')
            )
            .setFooter({ text: `Toplam ${warnings[interaction.guild.id][user.id].length} uyarı` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 