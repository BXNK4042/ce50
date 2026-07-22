module.exports = {
  apps: [
    {
      name: "ce50-api",
      script: ".venv/bin/python",
      args: "-m uvicorn main:app --host 0.0.0.0 --port 8000",
      cwd: "./server",
      interpreter: "none",
      env: {
        JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
        DB_PATH: "ce50.db",
        UPLOAD_DIR: "static/uploads",
        CORS_ORIGINS: "http://localhost:3000"
      }
    },
    {
      name: "ce50-web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://localhost:8000"
      }
    }
  ]
};
