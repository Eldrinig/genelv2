const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder } = require('discord.js');

// Renk ve stil sabitleri
const BRAND_COLOR = '#FF6B6B';
const SUCCESS_COLOR = '#4CAF50';
const ERROR_COLOR = '#f44336';
const WARNING_COLOR = '#ff9800';
const INFO_COLOR = '#2196F3';

// Footer metni
const FOOTER_TEXT = 'ZoweCeldrin';
const FOOTER_ICON = 'https://i.imgur.com/XwVQxA5.png'; // Varsayılan bir ikon URL'si

// Embed oluşturucu yardımcı fonksiyon
function createCustomEmbed(title, description, color = BRAND_COLOR) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: FOOTER_TEXT, iconURL: FOOTER_ICON });
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ]
});

// Global Maps
client.tkmGames = new Map();
client.ruletGames = new Map();
client.kelimeGames = new Map();
client.sayıGames = new Map();
client.boostTimers = new Map();
client.treasureHunts = new Map(); // Hazine avı cooldown takibi için

// Durum animasyonu
function setStatusAnimation() {
    const name = "Eldrinig";
    let currentIndex = 0;
    let direction = 'forward';

    setInterval(() => {
        let displayText = "";
        
        if (direction === 'forward') {
            displayText = name.substring(0, currentIndex + 1);
            currentIndex++;
            
            if (currentIndex >= name.length) {
                setTimeout(() => {
                    direction = 'complete';
                }, 2000); // Tam kelime 2 saniye görünsün
            }
        } else if (direction === 'complete') {
            displayText = name;
            direction = 'forward';
            currentIndex = 0;
        }

        client.user.setPresence({
            activities: [{
                name: displayText,
                type: 4 // Custom Status
            }],
            status: 'online'
        });
    }, 1000); // Her saniye güncelle
}

// Bot hazır olduğunda
client.once('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);
    setStatusAnimation();
});

// Hata yakalayıcı geliştirmeleri
process.on('unhandledRejection', error => {
    console.error('Yakalanmamış Promise Reddi:', error);
    // Hata logunu bir kanala gönder
    const errorEmbed = createCustomEmbed(
        '❌ Sistem Hatası',
        `\`\`\`js\n${error.stack}\`\`\``,
        ERROR_COLOR
    );
    // Hata logu kanalına gönder (kanal ID'sini config'den alabilirsiniz)
});

client.on('error', error => {
    console.error('Discord.js Hatası:', error);
});

client.commands = new Collection();

// Komut dosyalarını yükle
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[UYARI] ${filePath} komut dosyasında gerekli "data" veya "execute" özellikleri eksik`);
        }
    }
}

// Event dosyalarını yükle
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    const reactionRoles = JSON.parse(fs.readFileSync('./data/reaction-roles.json', 'utf-8'));
    const guildReactionRoles = reactionRoles[reaction.message.guild.id];

    if (!guildReactionRoles) return;

    const roleData = guildReactionRoles.find(rr => 
        rr.messageId === reaction.message.id && 
        rr.emoji === reaction.emoji.name
    );

    if (roleData) {
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.add(roleData.roleId);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;

    const reactionRoles = JSON.parse(fs.readFileSync('./data/reaction-roles.json', 'utf-8'));
    const guildReactionRoles = reactionRoles[reaction.message.guild.id];

    if (!guildReactionRoles) return;

    const roleData = guildReactionRoles.find(rr => 
        rr.messageId === reaction.message.id && 
        rr.emoji === reaction.emoji.name
    );

    if (roleData) {
        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(roleData.roleId);
    }
});

// Özel kullanıcı ID'leri
const specialPair = {
    user1: '1130240996089802844', // İlk kullanıcı ID'si
    user2: '1329897099256664216'  // İkinci kullanıcı ID'si
};

// Oyun durumlarını takip etmek için Map'ler

// Şans hesaplama fonksiyonu
function calculateLuck(userId) {
    const lastBoost = client.boostTimers.get(userId);
    if (!lastBoost) return 1;

    const now = Date.now();
    if (now - lastBoost < 3600000) { // 1 saat içinde
        return 1.5; // %50 şans artışı
    }
    return 1;
}

// Komut işleyici geliştirmeleri
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                const errorEmbed = createCustomEmbed(
                    '❌ Komut Hatası',
                    'Bu komutu çalıştırırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
                    ERROR_COLOR
                );
                
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            const [action, region] = interaction.customId.split('_').slice(1);
            if (!action || !region) return;

            if (action === 'search' || action === 'map') {
                const handler = require('./events/treasureHuntHandler');
                await handler.execute(interaction);
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('help_')) {
                // Yardım menüsü işleyicisi buraya gelecek
                const handler = require('./commands/moderasyon/yardım');
                if (handler.handleSelect) {
                    await handler.handleSelect(interaction);
                }
            }
        }
    } catch (error) {
        console.error('Etkileşim işleme hatası:', error);
    }
});

// Oyun sistemleri için geliştirmeler
async function calculateLove(interaction, user1, user2) {
    const luck = calculateLuck(user1.id);
    const loveScore = Math.floor(Math.random() * 100 * luck);
    
    let category, description;
    if (loveScore >= 80) {
        category = 'Mükemmel Uyum! 💘';
        description = 'Bu aşk tam bir peri masalı!';
    } else if (loveScore >= 60) {
        category = 'Güzel Bir Uyum! 💝';
        description = 'Aranızda güzel bir kimya var!';
    } else if (loveScore >= 40) {
        category = 'Arkadaşça Bir Uyum 💌';
        description = 'İyi bir arkadaşlık potansiyeli görünüyor.';
    } else {
        category = 'Zayıf Uyum 💔';
        description = 'Belki başka zamanda, başka bir yerde...';
    }

    const loveEmbed = createCustomEmbed(
        '❤️ Aşk Ölçer',
        `**${user1.username}** ve **${user2.username}** arasındaki aşk sonucu:\n\n` +
        `**${category}**\n` +
        `${createProgressBar(loveScore)} ${loveScore}%\n\n` +
        `${description}`,
        '#ff69b4'
    )
    .setThumbnail('https://i.imgur.com/6vYlJai.png')
    .addFields(
        { name: '👤 Aşık 1', value: user1.username, inline: true },
        { name: '💘 Uyum', value: `${loveScore}%`, inline: true },
        { name: '👤 Aşık 2', value: user2.username, inline: true }
    );

    await interaction.reply({ embeds: [loveEmbed] });
}

function getEmojiForCategory(category) {
    const emojis = {
        'moderasyon': '',
        'eğlence': '',
        'araçlar': ''
    };
    return emojis[category] || '';
}

function createProgressBar(percent) {
    const filledChar = '';
    const emptyChar = '';
    const barLength = 10;
    const filledLength = Math.round((percent / 100) * barLength);
    const emptyLength = barLength - filledLength;
    return filledChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
}

// Kazananı belirle
function determineWinner(choice1, choice2, challenger, opponent) {
    const results = {
        'taş': { beats: 'makas', message: 'Taş makası kırar!' },
        'kağıt': { beats: 'taş', message: 'Kağıt taşı sarar!' },
        'makas': { beats: 'kağıt', message: 'Makas kağıdı keser!' }
    };

    if (choice1 === choice2) {
        return { winner: null, message: 'Aynı seçimi yaptınız!', color: '#ffff00' };
    }

    // Şans faktörünü hesapla
    const challengerLuck = calculateLuck(challenger);
    const opponentLuck = calculateLuck(opponent);

    // Şans faktörüne göre kazananı belirle
    const baseChance = results[choice1].beats === choice2 ? 0.7 : 0.3;
    const finalChance = baseChance * (challengerLuck / opponentLuck);

    if (Math.random() < finalChance) {
        return { winner: 'challenger', message: results[choice1].message, color: '#00ff00' };
    } else {
        return { winner: 'opponent', message: results[choice2].message, color: '#00ff00' };
    }
}

client.login(token); 