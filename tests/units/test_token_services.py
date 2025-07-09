from src.application.utils.token_services import TokenService

def test_tokens():
    token_services = TokenService("my_secret_key")
    user_id = 777
    token = token_services.create_access_token(user_id)
    assert token is not None
    assert token_services.get_user(token) == user_id

# Phuria
# phuria@mail.ru
# 1234567Qq