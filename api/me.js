import {setCors,isAdmin,needEnv} from '../lib/server.js';
export default function handler(req,res){if(setCors(req,res))return;if(needEnv(res))return res.status(503).json({admin:false});res.status(200).json({admin:isAdmin(req)});}
