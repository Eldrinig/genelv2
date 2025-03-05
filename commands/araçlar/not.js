const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

if (!fs.existsSync('./data/notes.json')) {
    fs.writeFileSync('./data/notes.json', JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('not')
        .setDescription('Not alma sistemi')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekle')
                .setDescription('Yeni not ekler')
                .addStringOption(option =>
                    option
                        .setName('başlık')
                        .setDescription('Notun başlığı')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('içerik')
                        .setDescription('Not içeriği')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('listele')
                .setDescription('Notları listeler'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sil')
                .setDescription('Not siler')
                .addStringOption(option =>
                    option
                        .setName('başlık')
                        .setDescription('Silinecek notun başlığı')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const notes = JSON.parse(fs.readFileSync('./data/notes.json', 'utf-8'));
        const userId = interaction.user.id;

        if (!notes[userId]) {
            notes[userId] = {};
        }

        if (subcommand === 'ekle') {
            const title = interaction.options.getString('başlık');
            const content = interaction.options.getString('içerik');

            notes[userId][title] = {
                content,
                date: Date.now()
            };

            fs.writeFileSync('./data/notes.json', JSON.stringify(notes, null, 2));

            const embed = new EmbedBuilder()
                .setTitle('📝 Not Eklendi')
                .addFields(
                    { name: 'Başlık', value: title },
                    { name: 'İçerik', value: content }
                )
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'listele') {
            const userNotes = notes[userId];
            
            if (Object.keys(userNotes).length === 0) {
                return interaction.reply({
                    content: 'Hiç notun bulunmuyor.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('📋 Notlarım')
                .setDescription(
                    Object.entries(userNotes)
                        .map(([title, note]) => {
                            const date = new Date(note.date).toLocaleDateString('tr-TR');
                            return `**${title}** (${date})\n${note.content}`;
                        })
                        .join('\n\n')
                )
                .setColor('#0099ff')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (subcommand === 'sil') {
            const title = interaction.options.getString('başlık');

            if (!notes[userId][title]) {
                return interaction.reply({
                    content: 'Böyle bir not bulunamadı.',
                    ephemeral: true
                });
            }

            delete notes[userId][title];
            fs.writeFileSync('./data/notes.json', JSON.stringify(notes, null, 2));

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Not Silindi')
                .setDescription(`"${title}" başlıklı not silindi.`)
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
}; 