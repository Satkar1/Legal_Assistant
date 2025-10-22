FROM python:3.12-slim

WORKDIR /app

# Install OS deps
RUN apt-get update && apt-get install -y build-essential libsndfile1 curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the whole project
COPY . .

# Hugging Face expects port 7860
ENV PORT=7860
EXPOSE 7860

# Start the unified app
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:7860", "--workers", "2", "--threads", "4", "--timeout", "120"]
