import { Router } from "express";
import { convertData } from "./apiConnection.js";
 
const router = Router();
 
/**
* @swagger
* /bankingSystemAlbora/v1/convetidor/:
*   post:
*     summary: Convertir divisas
*     description: |
*       Realiza la conversión de una cantidad de una moneda a otra usando una API externa.
*       Recomendación: asegúrate de enviar los códigos de moneda válidos (por ejemplo, USD, GTQ, EUR) y un monto mayor a 0.
*     tags:
*       - Convertidor
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               from:
*                 type: string
*                 description: "Código de la moneda de origen (ejemplo: USD)"
*                 example: "USD"
*               to:
*                 type: string
*                 description: "Código de la moneda de destino (ejemplo: GTQ)"
*                 example: "GTQ"
*               amount:
*                 type: number
*                 description: "Monto a convertir"
*                 example: 100
*             required:
*               - from
*               - to
*               - amount
*     responses:
*       200:
*         description: Conversión realizada exitosamente
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 base:
*                   type: string
*                   example: "USD"
*                 target:
*                   type: string
*                   example: "GTQ"
*                 conversionRate:
*                   type: number
*                   example: 7.8
*                 conversionAmount:
*                   type: number
*                   example: 780
*       400:
*         description: Error al convertir las divisas (parámetros inválidos o error de la API)
*       500:
*         description: Error interno del servidor
*/
router.post('/', convertData);
 
export default router;