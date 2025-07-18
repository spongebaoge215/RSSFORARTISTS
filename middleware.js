import { next } from '@vercel/edge';

export const config = {
  matcher: '/', // 只在访问网站主页时触发这个函数
};

export default async function middleware(request) {
  // 从Vercel环境变量中获取我们设置的密码
  const password = process.env.PASSWORD;
  const host = request.nextUrl.protocol + request.nextUrl.host;
  const url = new URL(request.url);

  // 如果您没有在Vercel上设置密码，则直接允许访问
  if (!password) {
    return next();
  }

  // 处理用户提交密码的请求
  if (request.method === 'POST') {
    const formData = await request.formData();
    if (formData.get('password') === password) {
      // 密码正确，重定向回主页，并设置一个cookie
      const response = new Response(null, {
        status: 302,
        headers: {
          'Location': url.pathname,
          'Set-Cookie': `vercel-password=${password}; Path=/; HttpOnly; Secure; SameSite=Strict`,
        },
      });
      return response;
    } else {
      // 密码错误，重定向到密码页面并附带错误提示
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${host}/password.html?error=1` },
      });
    }
  }

  // 检查用户浏览器是否带有正确的密码cookie
  const cookie = request.cookies.get('vercel-password');

  if (cookie?.value === password) {
    return next(); // cookie中的密码正确，显示真实网页
  } else {
    // 没有cookie或cookie错误，跳转到密码输入页
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${host}/password.html` },
    });
  }
}