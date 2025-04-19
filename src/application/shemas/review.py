from pydantic import BaseModel, Field, ValidationError

class ReviewSchema(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating must be an integer between 1 and 5")

class ReviewResponce(ReviewSchema):
    review_id: int
    product_id: int