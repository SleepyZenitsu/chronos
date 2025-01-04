import {Client, IntentsBitField, Events} from "discord.js";
import puppeteer from 'puppeteer';
import 'dotenv/config';

const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
    ],
});

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}`);
});


client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'summary') {
    await interaction.deferReply();

    const hasPermission = interaction.memberPermissions?.has('ModerateMembers');
    if (!hasPermission) {
      return interaction.editReply('You do not have permission to run this command');
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1024});
    await page.goto(process.env.ACTIVITY_URL ?? '');
    await page.waitForSelector('svg.appsummary');
    const selector = 'div[host]>.row';
    const element = await page.waitForSelector(selector);
    await page.waitForFunction(
      (sel, text) => {
        const element = document.querySelector(sel);
        if (!element?.textContent) return false;
        return !element.textContent.toLowerCase().includes(text);
      },
      {},
      selector,
      'loading',
    );
    element?.scrollIntoView();
    if (!element) {
      await browser.close();
      return interaction.editReply('Summary not found');
    }

    const screenshotBuffer = Buffer.from(await element.screenshot());

    await browser.close();

    await interaction.editReply({
      content: 'Summary',
      files: [{ attachment: screenshotBuffer, name: 'output.png' }]
    });
  }
});

client.login(process.env.TOKEN);
