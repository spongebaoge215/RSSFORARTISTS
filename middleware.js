import { NextResponse } from 'next/server';

// 这是最基础的中间件函数
export function middleware(request) {
  // 不做任何检查，直接允许访问下一个资源
  return NextResponse.next();
}

// 依然只对主页生效
export const config = {
  matcher: '/',
};