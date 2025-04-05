<#-- 新增邮箱验证专用布局 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>邮箱验证 - ${systemName}</title>
    <link href="/static/css/bootstrap.min.css" rel="stylesheet">
    <#-- 新增自定义MDUI风格 -->
    <link href="/static/css/mail-verify.css" rel="stylesheet">
</head>

<body class="verify-container">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8 col-xl-6">
                <div class="verify-card shadow-lg rounded-4">
                    <div class="row g-0">
                        <#-- 左侧装饰性图片 -->
                        <div class="col-md-4 d-none d-md-block">
                            <img src="/static/images/mail-verify.png" 
                                 alt="验证邮箱" 
                                 class="img-fluid rounded-start-4">
                        </div>
                        
                        <#-- 主要内容区域 -->
                        <div class="col-md-8 p-4">
                            <div class="d-flex flex-column h-100">
                                <h3 class="verify-title mb-4">
                                    <i class="bi bi-envelope-check me-2"></i>
                                    邮箱验证
                                </h3>
                                
                                <#-- 动态内容区域 -->
                                <div class="verify-content flex-grow-1">
                                    <#if success>
                                        <div class="alert alert-success rounded-3">
                                            <i class="bi bi-check-circle-fill me-2"></i>
                                            ${message!""}
                                        </div>
                                        <img src="/static/images/success.svg" 
                                             alt="成功" 
                                             class="w-50 mx-auto d-block mt-4">
                                    <#else>
                                        <div class="alert alert-danger rounded-3">
                                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                            ${message!"验证链接无效或已过期"}
                                        </div>
                                        
                                        <#-- 重新发送验证区域 -->
                                        <div class="resend-area mt-4">
                                            <button class="btn btn-primary rounded-pill w-100 py-2"
                                                    id="resendBtn">
                                                重新发送验证邮件
                                            </button>
                                            <div class="text-muted mt-2 small">
                                                未收到邮件？请检查垃圾邮件箱或联系管理员
                                            </div>
                                        </div>
                                    </#if>
                                </div>
                                
                                <#-- 底部返回链接 -->
                                <div class="verify-footer mt-4 pt-3 border-top">
                                    <a href="/dashboard" class="text-decoration-none">
                                        <i class="bi bi-arrow-left me-2"></i>
                                        返回控制面板
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>