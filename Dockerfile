FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc

# Set working directory
WORKDIR /app

# Copy dependencies file
COPY requirements.txt .
COPY pyproject.toml .

# Install Python dependencies including dev dependencies for testing
RUN pip install -r requirements.txt
RUN pip install pytest

# Copy application files
COPY . .

EXPOSE 8000

# Set the command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
