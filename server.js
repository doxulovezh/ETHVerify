const Koa=require('koa')
const bodyParser = require('koa-bodyparser')
const sigUtil = require('eth-sig-util')
const app=new Koa()
const cors = require('koa2-cors');
app.use(
    cors({
        origin: function(ctx) { //设置允许来自指定域名请求
            if (ctx.url === '/verify') {
                return '*'; // 允许来自所有域名请求
            }
            return '*'; //只允许http://localhost:8080这个域名的请求
        },
        maxAge: 5, //指定本次预检请求的有效期，单位为秒。
        credentials: true, //是否允许发送Cookie
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法'
        allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
        exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
    })
);
app.use(bodyParser())
app.use(async(ctx)=>{
    if(ctx.url==='/verify'&& ctx.method==='GET'){
        let htmls =`
            <h1>Koa2 request post demo</h1>
            <form method="POST"  action="/">
                <p>userName</p>
                <input name="userName" /> <br/>
                <p>age</p>
                <input name="age" /> <br/>
                <p>webSite</p>
                <input name='webSite' /><br/>
                <button type="submit">submit</button>
            </form>
        `;
        ctx.body =htmls;
    }else if(ctx.url==='/verify' && ctx.method === 'POST'){
        // console.log(ctx.request.body)
        // let jsonfile=JSON.stringify(ctx.request.body)
        let jsonfile=ctx.request.body
        // jsonfile=JSON.parse(jsonfile)
        // console.log(jsonfile)
        console.log(jsonfile['verifyaddress '])
        console.log(jsonfile['sig'])
        console.log(jsonfile['from'])
        //计算验证签名
        /////////////////////////////ETH

        let msgParams = JSON.stringify({
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
                contents: jsonfile['verifyaddress'],
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
        let  recovered =sigUtil.recoverTypedSignature_v4({ data: JSON.parse(msgParams), sig: jsonfile['sig'] })
        console.log(recovered)
        if (recovered===jsonfile['from']){
            ctx.body=true;
        }else{
            ctx.body=false;
        }

    }else{
        //其它请求显示404页面
        ctx.body='<h1>404!</h1>';
    }
})
app.listen(30000,()=>{
    console.log('[demo] server is starting at port 30000');
})

