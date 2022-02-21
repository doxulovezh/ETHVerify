const web3 = require('web3');
const request = require('request');
const ethereumButton = document.querySelector('.enableEthereumButton');
const signTypedDataV4Button = document.querySelector('.signTypedDataV4Button');
const showAccount = document.querySelector('.showAccount');

if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}
signTypedDataV4Button.addEventListener('click', async function (event) {
    window.ethereum.enable()
    var TXTcfxaddress = document.getElementById('cfxaddresstxt');
    var TXTcfxcode = document.getElementById('codetxt');
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
            contents: TXTcfxaddress.value,
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
    // Sign()
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    let params= [account,msgParams];
    console.log(account)
    ethereum.request({
        method: 'eth_signTypedData_v4',
        params
    }).then((result) => {
        // The result varies by RPC method.
        // For example, this method will return a transaction hash hexadecimal string on success.
        console.log(result)
        //请求
        var options = {
            'method': 'POST',
            'url': 'https://47.103.111.129:50050/GetETHAddressVerify',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "verifyaddress": TXTcfxaddress.value,
                "sig": result,
                "from": account,
                "code":TXTcfxcode.value
            })

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
            alert("认证结果:"+response.body);
        });
    }).catch((error) => {
        // If the request fails, the Promise will reject with an error.
        console.log(error)
    });
});

ethereumButton.addEventListener('click', () => {
    getAccount();
});
async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    showAccount.innerHTML = account;
}
async function tranferETH() {
    let params= [
        {
            from:'0x44F020e9043bA4FFD50f1efba03eDeC2BEa265E5',
            to:'0x44F020e9043bA4FFD50f1efba03eDeC2BEa265E5',
            gas:'0x76c0', // 30400
            gasPrice:'0x9184e72a000', // 10000000000000
            value:'0x9184e72a', // 2441406250
            data:'0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        },
    ];

    ethereum.request({
        method: 'eth_sendTransaction',
        params,
    })
        .then((result) => {
            // The result varies by RPC method.
            // For example, this method will return a transaction hash hexadecimal string on success.
        })
        .catch((error) => {
            // If the request fails, the Promise will reject with an error.
        });

}
async function Sign() {
    var hashOfHash = web3.utils.sha3("秦风大哥")
    console.log(hashOfHash);
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    let params= [account,hashOfHash];
    ethereum.request({
        method: 'eth_sign',
        params,
    }).then((result) => {
        // The result varies by RPC method.
        // For example, this method will return a transaction hash hexadecimal string on success.
        console.log(result)
    }).catch((error) => {
        // If the request fails, the Promise will reject with an error.
        console.log(error)
    });

}