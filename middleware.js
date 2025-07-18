import { NextResponse } from 'next/server';

export const config = {
  // 我们只希望在访问根目录时进行密码检查
  // 所有其他资源（如 password.html, CSS, 图片等）都应该被放行
  matcher: '/',
};

export default async function middleware(request) {
  // 从Vercel环境变量中获取我们设置的密码
  const password = process.env.PASSWORD;
  const url = request.nextUrl;

  // 如果您没有在Vercel上设置密码，则直接允许访问
  if (!password) {
    return NextResponse.next();
  }

  // 处理从 /password.html 页面提交过来的密码
  if (request.method === 'POST') {
    const formData = await request.formData();
    if (formData.get('password') === password) {
      // 密码正确，重定向回主页，并设置一个cookie用于身份验证
      const response = NextResponse.redirect(url);
      response.cookies.set('vercel-password', password, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      return response;
    } else {
      // 密码错误，重定向到密码页面并附带错误提示
      const loginUrl = new URL('/password.html', request.url);
      loginUrl.searchParams.set('error', '1');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 检查用户浏览器是否带有正确的密码cookie
  const cookie = request.cookies.get('vercel-password');

  if (cookie?.value === password) {
    return NextResponse.next(); // cookie中的密码正确，显示真实网页
  } else {
    // 没有cookie或cookie错误，跳转到密码输入页
    const loginUrl = new URL('/password.html', request.url);
    return NextResponse.redirect(loginUrl);
  }
}