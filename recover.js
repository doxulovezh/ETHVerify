const sigUtil = require('eth-sig-util')
const msgParams = JSON.stringify({
    domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: "4",
        // Give a user friendly name to the specific contract you are signing for.
        name: '星图比特',
        // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
    },

    // Defining the message signing data content.
    message: {
        /*
         - Anything you want. Just a JSON Blob that encodes the data you want to send
         - No required fields
         - This is DApp Specific
         - Be as explicit as possible when building out the message schema.
        */
        contents: '秦风大哥牛逼!',
        // attachedMoneyInEth: 4.2,
        // from: {
        //     name: 'Cow',
        //     wallets: [
        //         '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        //         '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        //     ],
        // },
        // to: [
        //     {
        //         name: 'Bob',
        //         wallets: [
        //             '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        //             '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
        //             '0xB0B0b0b0b0b0B000000000000000000000000000',
        //         ],
        //     },
        // ],
    },
    // Refers to the keys of the *types* object below.
    primaryType: 'Conflux',
    types: {
        // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
        ],
        // Not an EIP712Domain definition
        Group: [
            { name: 'name', type: 'string' },
            { name: 'members', type: 'Person[]' },
        ],
        // Refer to PrimaryType
        Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person[]' },
            { name: 'contents', type: 'string' },
        ],
        // Not an EIP712Domain definition
        Person: [
            { name: 'name', type: 'string' },
            { name: 'wallets', type: 'address[]' },
        ],
        Conflux: [
            { name: 'contents', type: 'string' },
        ],
    },
});
const  recovered =sigUtil.recoverTypedSignature_v4({ data: JSON.parse(msgParams), sig: "0x2e7598dac91794a1c90e6ca4e3e089bdd27a2f91eefd88c2a7c8015f116adece47d76bf4a678b3c179103a3198de642993aeba69ec9ee3a2b64bdb8dc9d734711b" })
console.log(recovered)