const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const kelimeler = [
    'ARABA', 'KALEM', 'TELEFON', 'BİLGİSAYAR', 'MASA', 'KİTAP', 'DEFTER', 'PENCERE', 'KAPI', 'SANDALYE',
    'OKUL', 'BAHÇE', 'DENİZ', 'GÜNEŞ', 'YILDIZ', 'BULUT', 'YAĞMUR', 'ŞEMSİYE', 'ÇANTA', 'AYAKKABI',
    'GÖZLÜK', 'SAAT', 'PARA', 'CÜZDAN', 'ANAHTAR', 'LAMBA', 'RADYO', 'TELEVİZYON', 'KOLTUK', 'YATAK',
    "TELEFON", "BİLGİSAYAR", "KLAVYE", "FARE", "MONİTÖR",
    "PENCERE", "KAPI", "DUVAR", "TAVAN", "ZEMİN",
    "GÜNEŞ", "AY", "YILDIZ", "BULUT", "YAĞMUR",
    "DENİZ", "OKYANUS", "NEHİR", "GÖL", "DAĞLAR",
    "AĞAÇ", "ÇİÇEK", "YAPRAK", "ORMAN", "BAHÇE",
    "ASLAN", "KAPLAN", "FİL", "ZEBRA", "ZÜRAFa",
    "KÖPEK", "KEDİ", "BALIK", "KUŞ", "TAVŞAN",
    "ELMA", "ARMUT", "MUZ", "PORTAKAL", "MANDALİNA",
    "DOMATES", "SALATALIK", "PATATES", "SOĞAN", "HAVUÇ",
    "OKUL", "HASTANE", "MARKET", "PARK", "STADYUM",
    "ARABA", "OTOBÜS", "TREN", "UÇAK", "GEMİ",
    "FUTBOL", "BASKETBOL", "VOLEYBOl", "TENİS", "YÜZME",
    "GÖZLÜK", "SAAT", "ÇANTA", "AYAKKABI", "ELBİSE",
    "PANTOLON", "GÖMLEK", "CEKET", "ŞAPKA", "ELDIVEN",
    "KAHVE", "ÇAY", "SU", "MEYVESUYU", "KOLA",
    "EKMEK", "PEYNİR", "YUMURTA", "TEREYAĞI", "BAL",
    "MUTFAK", "SALON", "YATAK", "BANYO", "BALKON",
    "ŞARKI", "MÜZİK", "FİLM", "TİYATRO", "SİNEMA",
    "RESİM", "HEYKEL", "FOTOĞRAF", "ŞİİR", "KİTAPLIK",
    "KALEM", "SİLGİ", "MAKAS", "BANT", "CETVEL",
    "DÜNYA", "GEZEGEN", "UZAY", "YILDIZ", "GÜNEŞ",
    "SABAH", "ÖĞLE", "AKŞAM", "GECE", "GÜNDÜZ",
    "İLKBAHAR", "YAZ", "SONBAHAR", "KIŞ", "MEVSİM",
    "PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE",
    "CUMA", "CUMARTESİ", "HAFTA", "AY", "YIL",
    "KUZEY", "GÜNEY", "DOĞU", "BATI", "MERKEZ",
    "ANAHTAR", "KİLİT", "KAPI", "PENCERE", "DUVAR",
    "BAYRAK", "VATAN", "MİLLET", "DEVLET", "ÜLKE",
    "SEVGİ", "SAYGI", "DOSTLUK", "BARIŞ", "MUTLULUK"
];

module.exports = {
    kelimeler,
    data: new SlashCommandBuilder()
        .setName('kelime')
        .setDescription('Kelime tahmin oyunu')
        .addUserOption(option =>
            option
                .setName('rakip')
                .setDescription('Oynamak istediğin rakip')
                .setRequired(true)),

    async execute(interaction) {
        const opponent = interaction.options.getUser('rakip');
        
        if (opponent.id === interaction.user.id) {
            return interaction.reply({
                content: 'Kendinle oynayamazsın!',
                flags: ['Ephemeral']
            });
        }

        if (opponent.bot) {
            return interaction.reply({
                content: 'Botlar ile oynayamazsın!',
                flags: ['Ephemeral']
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🎯 Kelime Tahmin Yarışı')
            .setDescription(`${opponent}, ${interaction.user} seninle kelime tahmin yarışı oynamak istiyor!\n\nOyun Kuralları:\n- Her oyuncuya 3 harf tahmin hakkı verilir\n- Kelimeyi ilk tahmin eden kazanır\n- Tüm harfler büyük yazılmalıdır`)
            .setColor('#00ff00')
            .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWQ4ZWU4ZmYwZWU0ZDZkZWRmNzE5YmRmZjc5ZGRkMGM5ZGU4ZDk5YiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/3o7btZ1Gm7ZL25pLMs/giphy.gif');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`kelime_accept_${interaction.user.id}_${opponent.id}`)
                    .setLabel('Kabul Et')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`kelime_reject_${interaction.user.id}_${opponent.id}`)
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
