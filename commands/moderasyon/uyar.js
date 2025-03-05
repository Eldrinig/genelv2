const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// Uyarı verilerini saklamak için dosya kontrolü
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}
if (!fs.existsSync('./data/warnings.json')) {
    fs.writeFileSync('./data/warnings.json', '{}');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uyar')
        .setDescription('Kullanıcıya uyarı verir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('kullanıcı')
                .setDescription('Uyarılacak kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('sebep')
                .setDescription('Uyarı sebebi')
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('kullanıcı');
        const reason = interaction.options.getString('sebep');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({
                content: 'Bu kullanıcı sunucuda bulunmuyor.',
                ephemeral: true
            });
        }

        // Uyarı verilerini yükle
        const warnings = JSON.parse(fs.readFileSync('./data/warnings.json', 'utf-8'));
        
        // Sunucu ve kullanıcı için uyarı kaydı oluştur
        if (!warnings[interaction.guild.id]) {
            warnings[interaction.guild.id] = {};
        }
        if (!warnings[interaction.guild.id][user.id]) {
            warnings[interaction.guild.id][user.id] = [];
        }

        // Yeni uyarıyı ekle
        const warning = {
            reason: reason,
            moderator: interaction.user.id,
            timestamp: Date.now()
        };
        warnings[interaction.guild.id][user.id].push(warning);

        // Uyarıları kaydet
        fs.writeFileSync('./data/warnings.json', JSON.stringify(warnings, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Kullanıcı Uyarıldı')
            .setColor('#ffff00')
            .addFields(
                { name: 'Uyarılan Kullanıcı', value: `${user.tag} (${user.id})` },
                { name: 'Uyaran Yetkili', value: `${interaction.user.tag}` },
                { name: 'Sebep', value: reason },
                { name: 'Toplam Uyarı', value: warnings[interaction.guild.id][user.id].length.toString() }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        try {
            await user.send({
                content: `${interaction.guild.name} sunucusunda uyarıldınız!\nSebep: ${reason}`
            });
        } catch (error) {
            // DM gönderilemezse sessizce devam et
        }
    }
}; 