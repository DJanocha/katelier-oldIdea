export const sample = {
  pass: {
    valid: 'dupadupa',
    invalid: 'dupadupaa',
    tooShort: '123'
  },
  email: {
    taken: 'emailfortest222222@test.test',
    artist: 'bubu@bubu.bubu',
    artist2: 'bubu@bubu.bubu2',
    client: 'client@client.client',
    valid: '',
    invalid: 'ema@em'
  },
  names: {
    category: ['first category', 'second category'],
    project: ['first project name', 'second project name']
  }
} as const;
