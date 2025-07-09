import logging
import sys
from pathlib import Path

# создать и покрыть код сообщениями с помощью logger, записать в файл и в консоль
# переделать 400 ошибки на роутерах более кастомными найти где может юзер ошибиться и сделать кастомные ошибки


def setup_logger(name: str = "app", log_file: str = "app.log", level: int = logging.INFO):
    """Set up logger with file and console handlers"""
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    # Create formatter
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # Create file handler
    log_path = Path("logs")
    log_path.mkdir(exist_ok=True)
    file_handler = logging.FileHandler(log_path / log_file, encoding="utf-8")
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)

    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


# Create default logger instance
logger = setup_logger()
