#!/usr/bin/env node

// /*
// ___/\/\/\/\/\__________________________/\/\________________/\/\___________________________
// _/\/\____________/\/\/\____/\/\/\/\____________/\/\/\______/\/\______/\/\/\____/\/\__/\/\_
// _/\/\__________/\/\__/\/\__/\/\__/\/\__/\/\________/\/\____/\/\____/\/\/\/\/\__/\/\/\/\___
// _/\/\__________/\/\__/\/\__/\/\/\/\____/\/\____/\/\/\/\____/\/\____/\/\________/\/\_______
// ___/\/\/\/\/\____/\/\/\____/\/\________/\/\/\__/\/\/\/\/\__/\/\/\____/\/\/\/\__/\/\_______
// ___________________________/\/\___________________________________________________________
// */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Defaults
const CHARSET_PATH = "charset/chinese.txt";
const INPUT_PATH = "example/alice.txt";
const KEYFILE_PATH = "out/key.json";
const OUT_PATH = "out/alice.txt";
const BASE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");

// Store
let charset, keyfile, documentText;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function banner() {
  console.clear();
  figlet.text(
    "copialer",
    {
      font: "Ticks",
    },
    function (err, data) {
      console.log(data);
    }
  );
  await sleep(500);

  return true;
}

async function loadCharset() {
  let progress = createSpinner(`Loading default charset...`).start();

  // Get file from argv or use default
  // Read file to memory
  const source = path.resolve(__dirname, CHARSET_PATH);
  const data = fs.readFileSync(source, "utf8").replace(/ /g, "");

  progress.success({
    text: `Charset loaded: ${chalk.green(source)}`,
  });

  // Return charset
  return data;
}

async function generateKeyfile() {
  let progress = createSpinner(`Generating new keyfile...`).start();

  // Get output path from argv or use default
  const outfile = path.resolve(__dirname, KEYFILE_PATH);

  // Create object with key for each char in base charset
  let keysObject = BASE_CHARS.reduce(
    (acc, curr) => ((acc[curr] = ""), acc),
    {}
  );

  // Assign 4-8 random chars from charset for each letter/number
  // Remove char from charset to reduce duplicates
  for (let letter in keysObject) {
    keysObject[letter] = [];
    for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
      let newChar = charset.charAt(Math.floor(Math.random() * charset.length));
      keysObject[letter].push(newChar);
      charset = charset.replace(newChar, "");
    }
  }

  // Write keyfile to disk
  fs.writeFileSync(outfile, JSON.stringify(keysObject));

  progress.success({
    text: `Keyfile saved as: ${chalk.green(outfile)}`,
  });

  // Return Keyfile object
  return keysObject;
}

async function loadDocument() {
  let progress = createSpinner(`Loading document...`).start();

  // Load document from argv (required)
  // For now use example path
  let doc = path.resolve(__dirname, INPUT_PATH);
  let data = fs.readFileSync(doc, "utf-8");

  progress.success({
    text: `Document loaded: ${chalk.green(doc)}`,
  });

  // Return document
  return data;
}

async function loadModules() {
  console.log("\n");
  charset = await loadCharset();
  documentText = await loadDocument();
  keyfile = await generateKeyfile();
}

function encodeText(text) {
  for (let letter in keyfile) {
    let chars = keyfile[letter];
    let newChar = chars[Math.floor(Math.random() * chars.length)];
    let regex = new RegExp(letter, "g");
    text = text.replace(regex, newChar);
  }

  return text;
}

async function encodeDocument() {
  let progress = createSpinner(`Encoding document...`).start();

  // Encode text
  let rawEncoded = encodeText(documentText);

  // Write document
  let output = path.resolve(__dirname, OUT_PATH);
  fs.writeFileSync(output, rawEncoded);

  progress.success({
    text: `Encoding Complete: ${chalk.green(output)}`,
  });

  console.log(`

${encodeText("Thats all folks!")}
- D
  `);
}

//
// Start Execution
//

// Show Banner Load Modules
await banner();
await loadModules();
await encodeDocument();
