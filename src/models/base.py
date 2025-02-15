from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class AbstractBase(Base):
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True)