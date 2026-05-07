from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TurmaResponse(BaseModel):
    """
    Contrato público de resposta para turmas.

    Não exponha automaticamente todas as colunas da tabela `turmas`.
    Inclua aqui apenas campos que o frontend realmente pode consumir.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    arena_id: UUID
    professor_id: UUID
    valor_mensalidade: Decimal