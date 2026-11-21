import {setCors,clearCookie} from '../lib/server.js';export default function handler(req,res){if(setCors(req,res))return;clearCookie(res);res.status(200).json({ok:true});}
