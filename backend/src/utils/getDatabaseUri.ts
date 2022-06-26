const def = {
  db: 'test',
  user: 'daniel',
  pass: 'janocha'
};

export const getUri = ({
  user,
  db,
  pass
}: { user?: string; db?: string; pass?: string } = {}) => {
  const user_string = user || process.env.DB_LOGIN || def.user;
  const password = pass || process.env.DB_PASS || def.pass;
  const db_name = db || process.env.DB_NAME || def.db;
  const base_string = process.env.DB_URI || '';

  const uri = base_string
    .replace('<DB_PASS>', password)
    .replace('<DB_LOGIN>', user_string)
    .replace('<DB_NAME>', db_name);
  return uri;
};
