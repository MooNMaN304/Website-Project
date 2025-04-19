from pydantic import BaseModel, field_validator, EmailStr, constr

class UserBase(BaseModel):
    password: constr(min_length=8, max_length=200)  # Minimum 8 characters
    email: EmailStr  # Email address


class UserSchema(UserBase):
    user_id: int
    username: constr(min_length=3, max_length=20) 
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number")
        if not any(char.isalpha() for char in value):
            raise ValueError("Password must contain at least one letter")
        return value

class UserAuth(UserBase):
    pass

class UserInit(BaseModel):
    token: str