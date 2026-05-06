from app.infrastructure.db import Base
from sqlalchemy import Column, Integer, String

class Table_Base(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String)
    email = Column(String)