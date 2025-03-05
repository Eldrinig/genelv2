const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Komut isimlerini kontrol etmek için bir Set oluştur
const commandNames = new Set();

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            // Komut isminin benzersiz olup olmadığını kontrol et
            if (commandNames.has(command.data.name)) {
                console.error(`Hata: "${command.data.name}" isimli komut birden fazla kez tanımlanmış!`);
                continue;
            }
            
            commandNames.add(command.data.name);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[UYARI] ${filePath} komut dosyasında gerekli "data" veya "execute" özellikleri eksik`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`${commands.length} adet komut yükleniyor...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`${data.length} adet komut başarıyla yüklendi.`);
    } catch (error) {
        console.error(error);
    }
})(); 