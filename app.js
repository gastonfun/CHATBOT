const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola bienvenido al *Chatbot* En que puedo ayudarte?')
    
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("Este es el flujo Welcome", {
        delay:500,
    },
    async (ctx, ctxFn) => {
        if (ctx.body.includes("casas")){
            await ctxFn.flowDynamic("Escribiste casas")
        }else{
            await ctxFn.flowDynamic("Escribiste otra cosa")

        }
            console.log(ctx.body)
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowWelcome])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
