from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

# class OrderSchema(BaseModel):
#     user_id: int
#     payment: bool


class OrderSchema(BaseModel):
    id: int
    user_id: int
    payment: bool
    # другие поля...
    
    model_config = ConfigDict(from_attributes=True)  # Ранее называлось orm_mode