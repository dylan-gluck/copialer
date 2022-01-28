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
const CHARS_BASE = "charset/base.txt";
const CHARS_NEW =
  "charset/utf8_sequence_0-0xfff_assigned_printable_unseparated.txt";
const INFILE = "example/alice.txt";
const KEYFILE = "out/key.json";
const OUTFILE = "out/alice.txt";

// Store
let charsetBase, charsetNew, keyfile, infile, outfile;

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
}

async function loadCharsetBase() {
  let progress = createSpinner(`Loading base charset...`).start();

  // Get file from argv or use default
  // Read file to memory
  const source = path.resolve(__dirname, CHARS_BASE);
  const data = fs.readFileSync(source, "utf8").replace(/ /g, "").split("");

  progress.success({
    text: `Base Charset loaded: ${chalk.green(source)}`,
  });

  // Return charset
  return data;
}

async function loadCharsetNew() {
  let progress = createSpinner(`Loading new charset...`).start();

  // Get file from argv or use default
  // Read file to memory
  const source = path.resolve(__dirname, CHARS_NEW);
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
  const outfile = path.resolve(__dirname, KEYFILE);

  // Create object with key for each char in base charset
  let keyfileObject = {};

  // Assign 4-8 random chars from charset for each letter/number
  // Remove char from charset to reduce duplicates
  for (let letter in charsetBase) {
    keyfileObject[charsetBase[letter]] = [];
    for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
      let newChar = charsetNew.charAt(
        Math.floor(Math.random() * charsetNew.length)
      );
      keyfileObject[charsetBase[letter]].push(newChar);
      charsetNew = charsetNew.replace(newChar, "");
    }
  }

  // Write keyfile to disk
  fs.writeFileSync(outfile, JSON.stringify(keyfileObject));

  progress.success({
    text: `Keyfile saved as: ${chalk.green(outfile)}`,
  });

  // Return Keyfile object
  return JSON.stringify(keyfileObject);
}

async function loadDocument() {
  let progress = createSpinner(`Loading document...`).start();

  // Load document from argv (required)
  // For now use example path
  let doc = path.resolve(__dirname, INFILE);
  let data = fs.readFileSync(doc, "utf-8");

  progress.success({
    text: `Document loaded: ${chalk.green(doc)}`,
  });

  // Return document
  return data;
}

async function loadModules() {
  console.log("\n");
  charsetBase = await loadCharsetBase();
  charsetNew = await loadCharsetNew();
  infile = await loadDocument();
  keyfile = await generateKeyfile();
}

function encodeText(text) {
  let keysObject = JSON.parse(keyfile);
  for (let letter in keysObject) {
    let chars = keysObject[letter];
    let newChar = chars[Math.floor(Math.random() * chars.length)];
    let regex = new RegExp(letter, "g");
    text = text.replace(regex, newChar);
  }
  return text;
}

async function encodeDocument() {
  let progress = createSpinner(`Encoding document...`).start();

  // Encode text
  let rawEncoded = encodeText(infile);

  // Write document
  let output = path.resolve(__dirname, OUTFILE);
  fs.writeFileSync(output, rawEncoded);

  progress.success({
    text: `Encoding Complete: ${chalk.green(output)}`,
  });

  console.log(
    encodeText(
      `
      "In the end, it is impossible 
      not to become what others
      believe you are."
          
      - Julius Caesar
    `
    )
  );
}

//
// Start Execution
//

// Show Banner Load Modules
await banner();
await loadModules();
await encodeDocument();

// Exit
process.exit(1);
