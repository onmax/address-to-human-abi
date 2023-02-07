import { writeFile } from 'fs';
import axios from 'axios';
import { Interface } from 'ethers';

const usage = `Usage: node main.js <contract address> [--save [output_path]]
Example: node main.js 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6 --save abi.json`;

if (process.argv.length < 3) {
    console.log(usage);
    process.exit(1);
}

const CONTRACT_ADDRESS = process.argv[2];
const abiEndpoint = `https://api.etherscan.io/api?module=contract&action=getabi&address=${CONTRACT_ADDRESS}`;

let save = false;
let outputPath = `./abi-${CONTRACT_ADDRESS}.json`;

for (let i = 3; i < process.argv.length; i++) {
    if (process.argv[i] === '--save') {
        save = true;
        if (i + 1 < process.argv.length) {
            outputPath = process.argv[i + 1];
            if (!outputPath.endsWith('.json')) {
                outputPath += '.json';
            }
        }
        break;
    }
}

console.log(`Address contract: https://etherscan.io/address/${CONTRACT_ADDRESS}`);

axios.get(abiEndpoint)
    .then(function (response) {
        const abi = response.data.result;
        const jsonAbi = JSON.parse(abi);
        const iface = new Interface(jsonAbi);
        const abiHuman = iface.format('full');

        console.log('ABI Human Readable:');
        console.log(abiHuman);

        if (save) {
            writeFile(outputPath, JSON.stringify(abiHuman, null, 4), function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log(`The file was saved to ${outputPath}!`);
            });
        }
    })
    .catch(function (error) {
        console.error(error);
    });
