const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const fish = [
    { name: '🐟 Hamsi', chance: 30, value: 10 },
    { name: '🐠 Çipura', chance: 20, value: 25 },
    { name: '🐡 Levrek', chance: 15, value: 40 },
    { name: '🦈 Köpek Balığı', chance: 5, value: 100 },
    { name: '🐋 Balina', chance: 1, value: 500 },
    { name: '👢 Eski Bot', chance: 15, value: 1 },
    { name: '🪣 Kova', chance: 14, value: 2 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balık-tut')
        .setDescription('Balık tutarsın'),

    async execute(interaction) {
        const random = Math.random() * 100;
        let cumulative = 0;
        let caught = fish[fish.length - 1];
        let message = `${caught.name}\nDeğeri: ${caught.value} 💰`;

        for (const f of fish) {
            cumulative += f.chance;
            if (random <= cumulative) {
                caught = f;
                message = `${caught.name}\nDeğeri: ${caught.value} 💰`;
                break;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🎣 Balık Tutma')
            .setDescription(`${interaction.user} ${message}`)
            .setColor('#00bfff')
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjJlZmVmNzE2ZGNkNGM5NjRmZTk1ZGZhZDY3YjA0ZjQ1NWVkYmM5YiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o85xnoIXebk3xYx4Q/giphy.gif')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 