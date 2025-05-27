const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const path = require("path")
const fs = require("fs")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf-8")

const flowGracias = require('./flowGracias')


const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

/*
.addAnswer(const A, const B, const C, const D)

const A = Obligatorio: Un texto "hola", array ["hola", "como estas"]
const B = Opcional null = es un objeto {media, delay, capture, buttons}
const C = Opcional null = es una función callBack function!
const D = Opcional = es un array de flujos
*/
    
const flow1 = addKeyword("1")
    .addAnswer("Esta es la opcion 1")

const flow2 = addKeyword("2")
    .addAnswer("Esta es la opcion 2")

const flow3 = addKeyword("3")
    .addAnswer("Esta es la opcion 3")
    
const flowLargo = addKeyword(EVENTS.ACTION)
    .addAnswer("Escribiste mas de 10 caracteres asi que mereces esta respuestonta...")

let timeoutInactividad;

const flujoInactividad = addKeyword(EVENTS.ACTION)
    .addAction(async (_, { endFlow }) => {
        clearTimeout(timeoutInactividad);
        timeoutInactividad = setTimeout(() => {
            return endFlow("⏳ Sesión cerrada."); 
        }, 300000);
    })
    .addAnswer("¿En qué más puedo ayudarte?")

const palabrasClave = ['consultar', 'preguntar', 'ayudar', 'soporte', 'información']

const flowConsulta = addKeyword([...palabrasClave,'consulta', 'pregunta', 'duda', 'ayuda'])
    .addAnswer("Sí, dígame ¿En qué puedo ayudarlo?")
    

const menuFlow = addKeyword(EVENTS.WELCOME)
    /*.addAction(async (ctx, { gotoFlow }) => {
        if (/gracias/i.test(ctx.body)) {
            return gotoFlow(flowGracias);
        }
    })*/    

    .addAction(async (_, { endFlow }) => {
        setTimeout(() => {
            return endFlow("⏳ Sesión cerrada por inactividad.");
        }, 300000); // 5 minutos
    })
    .addAction(async (ctx, ctxFn) => {
        if (ctx.body.length > 10) {
            return ctxFn.gotoFlow(flowLargo)
        }
    })
    .addAction(async (ctx, { gotoFlow, fallBack }) => {
        const userText = ctx.body.toLowerCase();
        const hasKeyword = /...palabrasClave|consulta|pregunta|duda|ayuda/i.test(userText);
        if (hasKeyword) return gotoFlow(flowConsulta);
        return fallBack(); // Continúa con el siguiente flujo
    })
    
    .addAnswer("Bienvenido al menú principal...")

    .addAnswer(menu, {
        capture: true,
    }, async (ctx, ctxFn) => {
        const opciones = ["1", "2", "3", "0"]
        if (!opciones.includes(ctx.body)){
            return ctxFn.fallBack ("No elegiste una opcion correcta, tenes que elegir 1, 2, 3 o 0")
        }        
        if (ctx.body === "0"){
            return ctxFn.endFlow("Regresando al menu principal") 
        }
    }, [flow1, flow2, flow3])

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola bienvenido al *Chatbot* escribe *menu* para ver el menu', {
    })
 


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([menuFlow, flowLargo, flowPrincipal, flowConsulta, flujoInactividad])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main().catch(console.error); // para capturar errores no controlados
