const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// 1. SUPABASE CONNECTION
const supabase = createClient("https://pirjlajaydpyxehddjhj.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcmpsYWpheWRweXhlaGRkamhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MTE1OTIsImV4cCI6MjA5ODA4NzU5Mn0.ZuTG9x3x7xNbb0GGvCdCSnsU2RzEu-2AvU1OatKRh_4");

// 2. BOT CONFIGURATION
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define /register command
const registerCommand = new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your account for the game')
    .addStringOption(option => 
        option.setName('username')
            .setDescription('Your desired in-game username')
            .setRequired(true));

// 3. REGISTER SLASH COMMAND ON START
client.once('ready', async () => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.MTUxOTc4NTc1NjE0OTgxMzQ3OA.GCiK2L.liwcspCiv86JkceVDpc8MRLV7frzqPlzfgEdBI);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [registerCommand.toJSON()] }
        );
        console.log('✅ Global /register command deployed.');
    } catch (error) {
        console.error('❌ Error deploying command:', error);
    }
});

// 4. COMMAND LOGIC
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'register') {
        const username = interaction.options.getString('username');
        const discordId = interaction.user.id;
        const password = crypto.randomBytes(4).toString('hex'); // 8 random characters

        // Insert into Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ username: username, password: password, discord_id: discordId }]);

        if (error) {
            return await interaction.reply({ 
                content: `❌ **Error:** That username or your Discord account is already registered.`, 
                ephemeral: true 
            });
        }

        try {
            // Send credentials via DM
            await interaction.user.send(
                `🔑 **Account Created for BLUE BALL vs. RED BALL FFA!**\n\n` +
                `👤 **Username:** \`${username}\`\n` +
                `🔒 **Password:** \`${password}\`\n\n` +
                `Enter these credentials in the LOGIN tab inside the game and go get some kills!`
            );

            await interaction.reply({ 
                content: `Success! Your account has been created, <@${discordId}>. Check your DMs for your password! 📬`, 
                ephemeral: true 
            });
        } catch (dmError) {
            await interaction.reply({ 
                content: `⚠️ Your account was created, but your DMs are closed. Please open them so the bot can send your password!`, 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.MTUxOTc4NTc1NjE0OTgxMzQ3OA.GCiK2L.liwcspCiv86JkceVDpc8MRLV7frzqPlzfgEdBI);