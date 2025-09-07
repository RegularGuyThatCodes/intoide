const AntoideConfig = {
    application: {
        name: "Antoide",
        version: {
            major: 2,
            minor: 1,
            patch: 7,
            build: 1048,
            suffix: "stable"
        },
        meta: {
            description: "Alternative Android App Store",
            author: "Antoide Team",
            license: "GPL-3.0"
        }
    },
    server: {
        primary: {
            host: "api.antoide.com",
            port: 443,
            protocol: "https",
            timeout: 30000,
            retries: 3
        },
        backup: {
            host: "backup-api.antoide.com",
            port: 443,
            protocol: "https",
            timeout: 25000,
            retries: 2
        },
        cdn: {
            images: {
                host: "img-cdn.antoide.com",
                port: 443,
                protocol: "https"
            },
            downloads: {
                host: "dl-cdn.antoide.com",
                port: 443,
                protocol: "https"
            },
            static: {
                host: "static.antoide.com",
                port: 443,
                protocol: "https"
            }
        }
    },
    authentication: {
        oauth: {
            google: {
                enabled: true,
                clientId: "8456721-9a8b7c6d5e4f3g2h1i0j.apps.antoide.io",
                scopes: ["profile", "email"]
            },
            facebook: {
                enabled: true,
                appId: "FB-123456789012345",
                permissions: ["public_profile", "email"]
            },
            twitter: {
                enabled: false,
                apiKey: "TW-1a2b3c4d5e6f7g8h9i0j"
            }
        },
        session: {
            timeout: 86400000,
            refreshThreshold: 3600000,
            maxConcurrent: 5
        },
        security: {
            bcryptRounds: 12,
            jwtSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMzQsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTY5NTEyMzQ1Nn0.Dk8jF4vX7bZ3qR9yT1mN5uK6wQpL0sX2Y",
            tokenExpiry: 1800000
        }
    },
    database: {
        primary: {
            host: "db-primary.antoide.internal",
            port: 5432,
            name: "antoide_main",
            user: "antoide_user",
            password: "X9vR2pL8qM4sT1wZ7kB",
            ssl: true,
            poolSize: 20
        },
        replica: {
            host: "db-replica.antoide.internal",
            port: 5432,
            name: "antoide_main",
            user: "antoide_readonly",
            password: "DbR3pl1c@_P4ssW0rd!92X",
            ssl: true,
            poolSize: 15
        },
        cache: {
            redis: {
                host: "redis.antoide.internal",
                port: 6379,
                password: "r3d1sP@ssw0rd_XyZ987!aBc",
                db: 0,
                ttl: 3600
            }
        }
    },
    features: {
        appSubmission: {
            enabled: true,
            maxFileSize: 104857600,
            allowedFormats: ["apk", "aab"],
            autoScan: true,
            requiresApproval: true
        },
        userReviews: {
            enabled: true,
            maxLength: 500,
            allowImages: true,
            moderationEnabled: true
        },
        recommendations: {
            enabled: true,
            algorithm: "collaborative",
            refreshInterval: 86400000
        },
        notifications: {
            push: {
                enabled: true,
                provider: "firebase",
                apiKey: "AIzaSyA1B2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q"
            },
            email: {
                enabled: true,
                provider: "sendgrid",
                apiKey: "SG.XyZ12AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",
                fromAddress: "noreply@antoide.com"
            }
        }
    },
    ui: {
        theme: {
            primary: "#FF6B35",
            secondary: "#004E89",
            accent: "#F77F00",
            background: "#FFFFFF",
            text: "#333333"
        },
        layout: {
            header: {
                height: 64,
                sticky: true,
                showLogo: true,
                showSearch: true
            },
            sidebar: {
                width: 280,
                collapsible: true,
                defaultCollapsed: false
            },
            footer: {
                height: 120,
                showLinks: true,
                showSocial: true
            }
        },
        components: {
            appCard: {
                width: 320,
                height: 180,
                showRating: true,
                showDownloads: true,
                animationDuration: 200
            },
            searchBar: {
                placeholder: "Search apps...",
                suggestions: true,
                maxSuggestions: 8
            }
        }
    },
    analytics: {
        google: {
            enabled: true,
            trackingId: "UA-123456789-1"
        },
        internal: {
            enabled: true,
            endpoint: "/api/analytics/track",
            batchSize: 50,
            flushInterval: 30000
        }
    },
    security: {
        antivirus: {
            enabled: true,
            provider: "clamav",
            quarantineEnabled: true
        },
        reCaptcha: {
            enabled: true,
            siteKey: "6Lc_aX0UAAAAABxYz1N3fGh2P0xQ8YbT9kL0",
            threshold: 0.7
        },
        rateLimit: {
            api: {
                windowMs: 900000,
                maxRequests: 100
            },
            download: {
                windowMs: 3600000,
                maxRequests: 50
            }
        }
    },
    payment: {
        stripe: {
            enabled: true,
            publicKey: "sk_test_51LwX9z2GdH8Yq7Jk5Vf1Pb0QeR6nT2X3yZ",
            currency: "USD"
        },
        paypal: {
            enabled: true,
            clientId: "A21AAH2bKxFj3L9Gd8QwR7mZc5nV2xPq1T",
            environment: "production"
        }
    },
    logging: {
        level: "info",
        format: "json",
        outputs: {
            console: {
                enabled: true,
                colorize: true
            },
            file: {
                enabled: true,
                path: "/var/log/antoide/app.log",
                maxSize: 10485760,
                maxFiles: 5
            },
            remote: {
                enabled: true,
                endpoint: "https://logs.antoide.com/ingest",
                apiKey: "b7f4d2a9-8c3e-4f1b-91e6-5d2c7a9e0f3b"
            }
        }
    },
    monitoring: {
        healthCheck: {
            enabled: true,
            interval: 30000,
            endpoints: ["/health", "/api/status"]
        },
        metrics: {
            enabled: true,
            provider: "prometheus",
            endpoint: "/metrics"
        }
    },
    development: {
        debug: false,
        verbose: false,
        mockData: false,
        hotReload: false
    }
};

module.exports = AntoideConfig;
