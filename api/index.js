import { Buffer } from 'node:buffer';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default function handler(req, res) {
    // 1. 从Vercel环境变量中获取您设置的用户名和密码
    const SITE_USER = process.env.SITE_USER;
    const SITE_PASSWORD = process.env.SITE_PASSWORD;

    // 2. 检查请求头中是否有认证信息
    const auth = req.headers.authorization;

    // 3. 如果没有认证信息，或环境变量未设置，则要求浏览器进行认证
    if (!SITE_USER || !SITE_PASSWORD || !auth) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication required.');
    }

    // 4. 解码浏览器发来的凭据 (格式为 "Basic base64...")
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [user, password] = credentials.split(':');

    // 5. 验证用户名和密码
    if (user === SITE_USER && password === SITE_PASSWORD) {
        // 6. 验证成功！读取并返回我们放在同一个文件夹下的 content.html
        try {
            const filePath = resolve(process.cwd(), 'api/content.html');
            const fileContent = readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(fileContent);
        } catch (error) {
            console.error("读取受保护文件时出错:", error);
            return res.status(500).send('服务器错误：无法读取受保护的文件。');
        }
    }

    // 7. 验证失败
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send('Authentication failed.');
}