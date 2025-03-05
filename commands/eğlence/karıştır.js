const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('karıştır')
        .setDescription('Metni karıştırır')
        .addStringOption(option =>
            option
                .setName('metin')
                .setDescription('Karıştırılacak metin')
                .setRequired(true)),

    async execute(interaction) {
        const text = interaction.options.getString('metin');
        const shuffled = text.split(' ').map(word => {
            if (word.length <= 2) return word;
            
            const first = word[0];
            const last = word[word.length - 1];
            let middle = word.slice(1, -1).split('');
            
            for (let i = middle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [middle[i], middle[j]] = [middle[j], middle[i]];
            }
            
            return first + middle.join('') + last;
        }).join(' ');

        await interaction.reply(`🔀 ${shuffled}`);
    }
}; 