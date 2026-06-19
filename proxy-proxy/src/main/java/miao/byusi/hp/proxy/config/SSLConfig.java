package miao.byusi.hp.proxy.config;

import cn.hserver.core.ioc.annotation.Bean;
import cn.hserver.core.ioc.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;

/**
 * SSL证书自定义配置
 * 支持用户配置自定义SSL证书用于HTTPS连接
 */
@Bean
public class SSLConfig {
    private static final Logger log = LoggerFactory.getLogger(SSLConfig.class);

    @Value("ssl.enabled")
    private Boolean sslEnabled;

    @Value("ssl.keyStore")
    private String keyStore;

    @Value("ssl.keyStorePassword")
    private String keyStorePassword;

    @Value("ssl.keyManagerPassword")
    private String keyManagerPassword;

    @Value("ssl.keyStoreType")
    private String keyStoreType;

    @Value("ssl.trustStore")
    private String trustStore;

    @Value("ssl.trustStorePassword")
    private String trustStorePassword;

    @Value("ssl.trustStoreType")
    private String trustStoreType;

    @Value("ssl.protocol")
    private String protocol;

    @Value("ssl.clientAuth")
    private Boolean clientAuth;

    private SSLContext sslContext;

    /**
     * 初始化SSL上下文
     */
    @Bean
    public SSLContext sslContext() {
        if (sslEnabled == null || !sslEnabled) {
            log.info("SSL自定义证书未启用");
            return null;
        }

        try {
            String ksType = keyStoreType != null ? keyStoreType : "JKS";
            String trustKsType = trustStoreType != null ? trustStoreType : "JKS";
            String sslProtocol = protocol != null ? protocol : "TLS";

            // 初始化KeyStore
            KeyStore keyStoreInstance = KeyStore.getInstance(ksType);
            if (keyStore != null && !keyStore.isEmpty()) {
                try (FileInputStream fis = new FileInputStream(keyStore)) {
                    keyStoreInstance.load(fis, keyStorePassword != null ? keyStorePassword.toCharArray() : null);
                }
                log.info("加载自定义SSL证书: {}, 类型: {}", keyStore, ksType);
            } else {
                log.warn("SSL证书路径未配置");
                return null;
            }

            // 初始化KeyManagerFactory
            KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            keyManagerFactory.init(keyStoreInstance, keyManagerPassword != null ? keyManagerPassword.toCharArray() : null);

            // 初始化TrustManagerFactory（如果配置了trustStore）
            TrustManagerFactory trustManagerFactory = null;
            if (trustStore != null && !trustStore.isEmpty()) {
                KeyStore trustKeyStore = KeyStore.getInstance(trustKsType);
                try (FileInputStream fis = new FileInputStream(trustStore)) {
                    trustKeyStore.load(fis, trustStorePassword != null ? trustStorePassword.toCharArray() : null);
                }
                trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                trustManagerFactory.init(trustKeyStore);
                log.info("加载自定义信任证书: {}, 类型: {}", trustStore, trustKsType);
            }

            // 创建SSL上下文
            sslContext = SSLContext.getInstance(sslProtocol);
            sslContext.init(
                    keyManagerFactory.getKeyManagers(),
                    trustManagerFactory != null ? trustManagerFactory.getTrustManagers() : null,
                    null
            );

            log.info("SSL上下文初始化成功, 协议: {}, 客户端认证: {}", sslProtocol, clientAuth);

        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableKeyException |
                 CertificateException | IOException | java.security.KeyManagementException e) {
            log.error("SSL证书配置失败: {}", e.getMessage(), e);
            throw new RuntimeException("SSL证书配置失败", e);
        }

        return sslContext;
    }

    public Boolean getSslEnabled() {
        return sslEnabled;
    }

    public String getKeyStore() {
        return keyStore;
    }

    public String getKeyStorePassword() {
        return keyStorePassword;
    }

    public String getKeyManagerPassword() {
        return keyManagerPassword;
    }

    public String getKeyStoreType() {
        return keyStoreType;
    }

    public String getTrustStore() {
        return trustStore;
    }

    public String getTrustStorePassword() {
        return trustStorePassword;
    }

    public String getTrustStoreType() {
        return trustStoreType;
    }

    public String getProtocol() {
        return protocol;
    }

    public Boolean getClientAuth() {
        return clientAuth;
    }

    public SSLContext getSslContext() {
        return sslContext;
    }
}
