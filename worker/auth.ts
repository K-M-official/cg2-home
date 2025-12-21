import { Resend } from 'resend';
import { get_user_by_email, get_user_by_id, create_user, update_user_password, create_email_verification_code, verify_email_code, delete_email_verification_codes } from './db';

// ==================== JWT 工具函数 ====================

/**
 * 简单的 JWT 生成函数（不依赖外部库）
 */
async function generateJWT(payload: any, secret: string, expiresIn: number = 86400): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn
    };

    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    
    return `${data}.${signatureB64}`;
}

/**
 * 简单的 JWT 验证函数
 */
async function verifyJWT(token: string, secret: string): Promise<any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();
    
    // 验证签名
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );
    
    const signature = Uint8Array.from(
        atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), 
        c => c.charCodeAt(0)
    );
    
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    
    if (!isValid) {
        throw new Error('Invalid signature');
    }
    
    // 解码 payload
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    
    // 检查过期时间
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
    }
    
    return payload;
}

/**
 * 密码哈希函数
 */
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 生成随机令牌
 */
function generateRandomToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 生成6位数字验证码
 */
function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== CORS 头 ====================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
} as const;

// ==================== 认证 API 处理函数 ====================

/**
 * 发送验证码到邮箱
 * POST /api/auth/send-code
 * Body: { email: string }
 */
export async function handleSendCode(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json<{ email?: string }>();
        const { email } = body;

        // 参数验证
        if (!email) {
            return new Response(
                JSON.stringify({ error: 'INVALID_PARAMS', message: 'Email is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: 'INVALID_EMAIL', message: 'Invalid email format' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 生成验证码
        const code = generateVerificationCode();
        const expiresAt = Date.now() + 600000; // 10分钟后过期

        // 打印验证码到控制台（用于调试）
        console.log('=================================');
        console.log('📧 发送验证码到:', email);
        console.log('🔢 验证码:', code);
        console.log('⏰ 过期时间:', new Date(expiresAt).toISOString());
        console.log('=================================');

        // 保存验证码到数据库
        await create_email_verification_code(env.DB, email, code, expiresAt);

        // 发送邮件（如果配置了 Resend）
        if (env.RESEND_API_KEY) {
            try {
                const resend = new Resend(env.RESEND_API_KEY);

                console.log('📨 正在通过 Resend 发送邮件...');

                const result = await resend.emails.send({
                    from: 'service.permane.world@enzyme.cloud',
                    to: email,
                    subject: '邮箱验证码',
                    html: `
                        <h2>邮箱验证</h2>
                        <p>您的验证码是：</p>
                        <h1 style="font-size: 32px; letter-spacing: 8px; color: #8B5CF6;">${code}</h1>
                        <p>验证码将在10分钟后过期。</p>
                        <p>如果这不是您的操作，请忽略此邮件。</p>
                    `
                });

                console.log('✅ 邮件发送成功:', result);
            } catch (emailError) {
                console.error('❌ 邮件发送失败:', emailError);
                // 继续执行，不因邮件发送失败而中断
            }
        } else {
            console.warn('⚠️  未配置 RESEND_API_KEY，跳过邮件发送');
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Verification code sent',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in handleSendCode:', error);
        return new Response(
            JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * 处理用户注册
 * POST /api/auth/register
 * Body: { email: string, password: string, code: string }
 */
export async function handleRegister(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json<{ email?: string; password?: string; code?: string }>();
        const { email, password, code } = body;

        // 参数验证
        if (!email || !password || !code) {
            return new Response(
                JSON.stringify({ error: 'INVALID_PARAMS', message: 'Email, password and verification code are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: 'INVALID_EMAIL', message: 'Invalid email format' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 密码长度验证
        if (password.length < 6) {
            return new Response(
                JSON.stringify({ error: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 验证邮箱验证码
        const isCodeValid = await verify_email_code(env.DB, email, code);
        if (!isCodeValid) {
            return new Response(
                JSON.stringify({ error: 'INVALID_CODE', message: 'Invalid or expired verification code' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 检查用户是否已存在
        const existingUser = await get_user_by_email(env.DB, email);
        if (existingUser) {
            return new Response(
                JSON.stringify({ error: 'USER_EXISTS', message: 'User already exists' }),
                { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 哈希密码
        const password_hash = await hashPassword(password);

        // 创建用户
        const user_id = await create_user(env.DB, email, password_hash);

        // 删除已使用的验证码
        await delete_email_verification_codes(env.DB, email);

        // 生成 JWT
        const jwtSecret = env.JWT_SECRET || 'default-secret-change-in-production';
        const token = await generateJWT({ user_id, email }, jwtSecret);

        return new Response(
            JSON.stringify({ 
                success: true, 
                token,
                user: { id: user_id, email }
            }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in handleRegister:', error);
        return new Response(
            JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * 处理用户登录
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
export async function handleLogin(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json<{ email?: string; password?: string }>();
        const { email, password } = body;

        // 参数验证
        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: 'INVALID_PARAMS', message: 'Email and password are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 获取用户
        const user = await get_user_by_email(env.DB, email);
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 验证密码
        const password_hash = await hashPassword(password);
        if (password_hash !== user.password_hash) {
            return new Response(
                JSON.stringify({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 生成 JWT
        const jwtSecret = env.JWT_SECRET || 'default-secret-change-in-production';
        const token = await generateJWT({ user_id: user.id, email: user.email }, jwtSecret);

        return new Response(
            JSON.stringify({ 
                success: true, 
                token,
                user: { id: user.id, email: user.email }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in handleLogin:', error);
        return new Response(
            JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * 处理忘记密码请求（发送验证码）
 * POST /api/auth/forgot-password
 * Body: { email: string }
 */
export async function handleForgotPassword(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json<{ email?: string }>();
        const { email } = body;

        // 参数验证
        if (!email) {
            return new Response(
                JSON.stringify({ error: 'INVALID_PARAMS', message: 'Email is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 获取用户
        const user = await get_user_by_email(env.DB, email);
        
        // 为了安全起见，即使用户不存在也返回成功
        // 这样可以防止攻击者枚举用户邮箱
        if (!user) {
            return new Response(
                JSON.stringify({ 
                    success: true, 
                    message: 'If the email exists, a verification code will be sent' 
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 生成验证码
        const code = generateVerificationCode();
        const expiresAt = Date.now() + 600000; // 10分钟后过期

        // 打印验证码到控制台（用于调试）
        console.log('=================================');
        console.log('📧 发送验证码到:', email);
        console.log('🔢 验证码:', code);
        console.log('⏰ 过期时间:', new Date(expiresAt).toISOString());
        console.log('=================================');

        // 保存验证码到数据库
        await create_email_verification_code(env.DB, email, code, expiresAt);

        // 发送邮件（如果配置了 Resend）
        if (env.RESEND_API_KEY) {
            try {
                const resend = new Resend(env.RESEND_API_KEY);

                console.log('📨 正在通过 Resend 发送密码重置邮件...');

                const result = await resend.emails.send({
                    from: 'service.permane.world@enzyme.cloud',
                    to: email,
                    subject: '密码重置验证码',
                    html: `
                        <h2>密码重置</h2>
                        <p>您请求重置密码。您的验证码是：</p>
                        <h1 style="font-size: 32px; letter-spacing: 8px; color: #8B5CF6;">${code}</h1>
                        <p>验证码将在10分钟后过期。</p>
                        <p>如果您没有请求重置密码，请忽略此邮件。</p>
                    `
                });

                console.log('✅ 密码重置邮件发送成功:', result);
            } catch (emailError) {
                console.error('❌ 密码重置邮件发送失败:', emailError);
                // 继续执行，不因邮件发送失败而中断
            }
        } else {
            console.warn('⚠️  未配置 RESEND_API_KEY，跳过邮件发送');
        }

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'If the email exists, a verification code will be sent',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in handleForgotPassword:', error);
        return new Response(
            JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * 处理密码重置（使用验证码）
 * POST /api/auth/reset-password
 * Body: { email: string, code: string, password: string }
 */
export async function handleResetPassword(request: Request, env: Env): Promise<Response> {
    try {
        const body = await request.json<{ email?: string; code?: string; password?: string }>();
        const { email, code, password } = body;

        // 参数验证
        if (!email || !code || !password) {
            return new Response(
                JSON.stringify({ error: 'INVALID_PARAMS', message: 'Email, code and password are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 密码长度验证
        if (password.length < 6) {
            return new Response(
                JSON.stringify({ error: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 验证邮箱验证码
        const isCodeValid = await verify_email_code(env.DB, email, code);
        if (!isCodeValid) {
            return new Response(
                JSON.stringify({ error: 'INVALID_CODE', message: 'Invalid or expired verification code' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 获取用户
        const user = await get_user_by_email(env.DB, email);
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'USER_NOT_FOUND', message: 'User not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 哈希新密码
        const password_hash = await hashPassword(password);

        // 更新密码
        await update_user_password(env.DB, user.id, password_hash);

        // 删除已使用的验证码
        await delete_email_verification_codes(env.DB, email);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: 'Password reset successfully'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in handleResetPassword:', error);
        return new Response(
            JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

/**
 * 验证JWT令牌
 * GET /api/auth/verify
 * Headers: Authorization: Bearer <token>
 */
export async function handleVerifyToken(request: Request, env: Env): Promise<Response> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const token = authHeader.substring(7); // 移除 "Bearer " 前缀
        const jwtSecret = env.JWT_SECRET || 'default-secret-change-in-production';

        // 验证JWT
        const payload = await verifyJWT(token, jwtSecret);

        // 获取用户信息
        const user = await get_user_by_id(env.DB, payload.user_id);
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'USER_NOT_FOUND', message: 'User not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: true,
                user: { id: user.id, email: user.email }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in handleVerifyToken:', error);
        return new Response(
            JSON.stringify({ error: 'INVALID_TOKEN', message: String(error) }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}

