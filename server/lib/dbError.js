export const formatDbError = (err) => {
  if (!err) return 'Erro desconhecido no banco de dados';

  if (err.name === 'AggregateError' && Array.isArray(err.errors) && err.errors.length > 0) {
    const first = err.errors[0];
    if (first?.code === 'ECONNREFUSED') {
      return 'Não foi possível conectar ao PostgreSQL. Verifique EXTERNAL_DATABASE_URL e se o banco está ativo.';
    }
    return first?.message || 'Falha ao conectar ao PostgreSQL';
  }

  if (err.code === 'ECONNREFUSED') {
    return 'Não foi possível conectar ao PostgreSQL. Verifique EXTERNAL_DATABASE_URL e se o banco está ativo.';
  }

  return err.message || String(err);
};
