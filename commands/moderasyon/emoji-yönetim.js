const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji-yönetim')
        .setDescription('Emoji ayarlarını yönetir')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Yeni emoji ekler')
                .addStringOption(option =>
                    option
                        .setName('isim')
                        .setDescription('Emoji ismi')
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option
                        .setName('resim')
                        .setDescription('Emoji resmi')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sil')
                .setDescription('Emoji siler')
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Silinecek emoji')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Emojileri listeler')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'ekle': {
                const name = interaction.options.getString('isim');
                const attachment = interaction.options.getAttachment('resim');

                if (!attachment.contentType?.startsWith('image/')) {
                    return interaction.reply({
                        content: 'Lütfen geçerli bir resim dosyası yükleyin!',
                        ephemeral: true
                    });
                }

                const emoji = await interaction.guild.emojis.create({
                    attachment: attachment.url,
                    name: name
                });

                const embed = new EmbedBuilder()
                    .setTitle('✅ Emoji Eklendi')
                    .setColor('#00ff00')
                    .addFields(
                        { name: 'İsim', value: name },
                        { name: 'Emoji', value: `<:${emoji.name}:${emoji.id}>` }
                    )
                    .setThumbnail(attachment.url)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'sil': {
                const emojiInput = interaction.options.getString('emoji');
                const emojiMatch = emojiInput.match(/<:.+:(\d+)>/);

                if (!emojiMatch) {
                    return interaction.reply({
                        content: 'Lütfen geçerli bir özel emoji girin!',
                        ephemeral: true
                    });
                }

                const emojiId = emojiMatch[1];
                const emoji = interaction.guild.emojis.cache.get(emojiId);

                if (!emoji) {
                    return interaction.reply({
                        content: 'Bu emoji sunucuda bulunamadı!',
                        ephemeral: true
                    });
                }

                const emojiName = emoji.name;
                await emoji.delete();

                const embed = new EmbedBuilder()
                    .setTitle('❌ Emoji Silindi')
                    .setColor('#ff0000')
                    .setDescription(`\`${emojiName}\` emojisi silindi.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'liste': {
                const emojis = interaction.guild.emojis.cache;
                const regularEmojis = emojis.filter(e => !e.animated);
                const animatedEmojis = emojis.filter(e => e.animated);

                const embed = new EmbedBuilder()
                    .setTitle('📋 Emoji Listesi')
                    .setColor('#0099ff')
                    .addFields(
                        {
                            name: 'Normal Emojiler',
                            value: regularEmojis.size > 0 
                                ? regularEmojis.map(e => `<:${e.name}:${e.id}>`).join(' ')
                                : 'Yok'
                        },
                        {
                            name: 'Hareketli Emojiler',
                            value: animatedEmojis.size > 0
                                ? animatedEmojis.map(e => `<a:${e.name}:${e.id}>`).join(' ')
                                : 'Yok'
                        }
                    )
                    .setFooter({ text: `Toplam: ${emojis.size} emoji` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
}; 