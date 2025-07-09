class UserException(Exception):
    """Базовое исключение для всех пользовательских ошибок"""
    pass


class NotFoundUserException(UserException):
    """Пользователь не найден"""
    pass


class UserCreateException(UserException):
    """Ошибка при создании пользователя"""
    pass


class InvalidCredentialsException(UserException):
    """Неверный логин или пароль"""
    pass


class PasswordUpdateException(UserException):
    """Ошибка при обновлении пароля"""
    pass
