FROM python:3.12-slim AS runner
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN groupadd --system --gid 1001 app \
 && useradd --system --uid 1001 --gid app --create-home app
COPY --chown=app:app requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=app:app . .
ENV DB_PATH=/data/ce50.db UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads && chown -R app:app /data
USER app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
