import { Buffer } from 'node:buffer';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default function handler(req, res) {
    // 1. 从环境变量中获取预设的用户名和密码
    const VERCEL_USER = process.env.SITE_USER;
    const VERCEL_PASSWORD = process.env.SITE_PASSWORD;

    // 2. 检查请求头中是否有认证信息
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // 3. 如果没有认证信息，返回401，并告诉浏览器需要Basic Auth认证
        res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication required.');
    }

    // 4. 解码用户输入的用户名和密码
    const [user, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    // 5. 验证用户名和密码
    if (user === VERCEL_USER && password === VERCEL_PASSWORD) {
        // 6. 验证成功，读取并返回 public/index.html 文件的内容
        try {
            // 构建指向 public/index.html 的绝对路径
            const filePath = resolve(process.cwd(), 'public/index.html');
            const fileContent = readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            return res.status(200).send(fileContent);
        } catch (error) {
            return res.status(500).send('Error: Could not read the page file.');
        }
    } else {
        // 7. 验证失败，返回401
        res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Authentication failed.');
    }
}