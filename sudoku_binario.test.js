const { SudokuBinario, verificar, resolver, REGRA, TAMANHO } = require('./sudoku_binario');

const _ = null;

const SOLUCAO = [
  [0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1],
  [0, 1, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 0],
];

const ENUNCIADO = [
  [_, _, _, _, _, 1],
  [_, _, _, 0, 0, _],
  [_, 1, _, _, _, _],
  [0, _, 1, _, 0, _],
  [_, _, _, _, _, _],
  [_, _, 0, 0, _, _],
];

const vazia = () => Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(null));
const copiar = (grade) => grade.map((l) => [...l]);
const coluna = (grade, c) => grade.map((l) => l[c]);

function capturar(fn) {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
}

function resolverJogando(jogo) {
  for (let l = 0; l < TAMANHO; l++) {
    for (let c = 0; c < TAMANHO; c++) if (jogo.grade[l][c] === null) jogo.jogar(l, c, SOLUCAO[l][c]);
  }
}

describe('Material de referência dos testes', () => {
  test('a SOLUCAO é uma grade 6 x 6 válida, com três 0 e três 1 em cada linha e coluna', () => {
    expect(verificar(SOLUCAO)).toEqual([]);
    for (let i = 0; i < TAMANHO; i++) {
      expect(SOLUCAO[i].filter((v) => v === 1)).toHaveLength(3);
      expect(coluna(SOLUCAO, i).filter((v) => v === 1)).toHaveLength(3);
    }
  });

  test('o ENUNCIADO é compatível com a SOLUCAO: toda pista do enunciado está na solução', () => {
    ENUNCIADO.forEach((linha, l) =>
      linha.forEach((v, c) => {
        if (v !== null) expect(SOLUCAO[l][c]).toBe(v);
      }),
    );
  });
});

describe('R1 - a grade é 6 x 6 e cada célula é 0, 1 ou vazia', () => {
  test('o jogo guarda uma grade 6 x 6 copiada do enunciado', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.grade).toHaveLength(6);
    jogo.grade.forEach((linha) => expect(linha).toHaveLength(6));
    expect(jogo.grade).toEqual(ENUNCIADO);
    expect(jogo.grade).not.toBe(ENUNCIADO);
  });

  test.each([
    ['2 x 2', [[0, 1], [1, 0]]],
    ['7 linhas', [...ENUNCIADO, [_, _, _, _, _, _]]],
    ['5 colunas', ENUNCIADO.map((l) => l.slice(0, 5))],
    ['não é matriz', 'abc'],
  ])('grade de formato errado é recusada (%s)', (_nome, grade) => {
    expect(capturar(() => new SudokuBinario(grade)).codigo).toBe('FORMATO');
  });

  test.each([2, '1', true, -1, undefined])('célula com valor %p é recusada', (valor) => {
    const errada = copiar(ENUNCIADO);
    errada[0][1] = valor;
    expect(capturar(() => new SudokuBinario(errada)).codigo).toBe('VALOR');
  });

  test('o jogo não altera o enunciado recebido', () => {
    const original = copiar(ENUNCIADO);
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 0);
    expect(ENUNCIADO).toEqual(original);
  });
});

describe('R2 - nunca três números iguais seguidos', () => {
  test('três 1 seguidos na linha são recusados e a célula continua vazia', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 1);
    jogo.jogar(0, 1, 1);
    const e = capturar(() => jogo.jogar(0, 2, 1));
    expect(e.codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(e.message).toContain('linha 1 tem três números 1 seguidos');
    expect(jogo.grade[0][2]).toBeNull();
  });

  test('três 0 seguidos na coluna são recusados', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(2, 4, 0);
    jogo.jogar(3, 4, 0);
    const e = capturar(() => jogo.jogar(4, 4, 0));
    expect(e.codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(e.message).toContain('coluna 5 tem três números 0 seguidos');
  });

  test('preencher o buraco entre dois iguais também forma três seguidos', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(1, 0, 1);
    jogo.jogar(1, 2, 1);
    expect(capturar(() => jogo.jogar(1, 1, 1)).codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(() => jogo.jogar(1, 1, 0)).not.toThrow();
  });

  test('três seguidos no fim da linha também contam (colunas 3, 4 e 5)', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(5, 3, 0);
    jogo.jogar(5, 4, 0);
    expect(capturar(() => jogo.jogar(5, 5, 0)).codigo).toBe(REGRA.TRES_SEGUIDOS);
  });

  test('dois iguais seguidos são permitidos, e iguais separados também', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 0);
    expect(() => jogo.jogar(0, 1, 0)).not.toThrow();
    expect(() => jogo.jogar(0, 3, 0)).not.toThrow();
  });

  test('verificar aponta o eixo e o índice (base 0) da linha ou coluna que quebrou a regra', () => {
    const g = vazia();
    g[4] = [_, 1, 1, 1, _, _];
    expect(verificar(g)).toEqual([
      expect.objectContaining({ regra: REGRA.TRES_SEGUIDOS, eixo: 'linha', indices: [4] }),
    ]);
  });
});

describe('R3 - três 0 e três 1 em cada linha e coluna', () => {
  test('o quarto 0 de uma linha é recusado', () => {
    const jogo = new SudokuBinario(vazia());
    [0, 2, 4].forEach((c) => jogo.jogar(1, c, 0));
    const e = capturar(() => jogo.jogar(1, 5, 0));
    expect(e.codigo).toBe(REGRA.EXCESSO);
    expect(e.message).toContain('linha 2 tem mais de 3 números 0');
    expect(jogo.grade[1][5]).toBeNull();
  });

  test('o quarto 1 de uma coluna é recusado', () => {
    const jogo = new SudokuBinario(vazia());
    [0, 2, 4].forEach((l) => jogo.jogar(l, 3, 1));
    const e = capturar(() => jogo.jogar(5, 3, 1));
    expect(e.codigo).toBe(REGRA.EXCESSO);
    expect(e.message).toContain('coluna 4 tem mais de 3 números 1');
  });

  test('o terceiro 0 e o terceiro 1 são aceitos', () => {
    const jogo = new SudokuBinario(vazia());
    [0, 2, 4].forEach((c) => jogo.jogar(1, c, 0));
    [1, 3, 5].forEach((c) => jogo.jogar(1, c, 1));
    expect(jogo.grade[1]).toEqual([0, 1, 0, 1, 0, 1]);
  });

  test('verificar acusa 4 zeros numa linha mesmo sem três seguidos', () => {
    const g = vazia();
    g[0] = [0, 0, 1, 0, 0, _];
    expect(verificar(g).map((q) => q.regra)).toEqual([REGRA.EXCESSO]);
  });
});

describe('R4 - não há linhas iguais nem colunas iguais', () => {
  test('completar uma linha igual a outra linha completa é recusado', () => {
    const enunciado = vazia();
    enunciado[0] = [0, 1, 0, 1, 1, 0];
    enunciado[3] = [0, 1, 0, 1, 1, _];
    const jogo = new SudokuBinario(enunciado);
    const e = capturar(() => jogo.jogar(3, 5, 0));
    expect(e.codigo).toBe(REGRA.REPETIDA);
    expect(e.message).toContain('linhas 1 e 4 são iguais');
    expect(jogo.grade[3][5]).toBeNull();
  });

  test('completar uma coluna igual a outra coluna completa é recusado', () => {
    const enunciado = vazia();
    [1, 0, 0, 1, 1, 0].forEach((v, l) => (enunciado[l][0] = v));
    [1, 0, 0, 1, 1].forEach((v, l) => (enunciado[l][2] = v));
    const jogo = new SudokuBinario(enunciado);
    const e = capturar(() => jogo.jogar(5, 2, 0));
    expect(e.codigo).toBe(REGRA.REPETIDA);
    expect(e.message).toContain('colunas 1 e 3 são iguais');
  });

  test('linhas incompletas com o mesmo começo são permitidas', () => {
    const g = vazia();
    g[0] = [0, 1, 0, 1, _, _];
    g[1] = [0, 1, 0, 1, _, _];
    expect(verificar(g)).toEqual([]);
  });

  test('linhas que diferem em uma só célula são permitidas', () => {
    const g = vazia();
    g[0] = [0, 1, 0, 1, 1, 0];
    g[1] = [0, 1, 0, 1, 0, 1];
    expect(verificar(g)).toEqual([]);
  });
});

describe('Enunciado inválido', () => {
  test('enunciado que já tem três iguais seguidos é recusado', () => {
    const g = vazia();
    g[0] = [1, 1, 1, _, _, _];
    const e = capturar(() => new SudokuBinario(g));
    expect(e.codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(e.message).toContain('Enunciado inválido');
  });

  test('enunciado com quatro 1 na mesma coluna é recusado', () => {
    const g = vazia();
    [0, 2, 3, 5].forEach((l) => (g[l][0] = 1));
    expect(capturar(() => new SudokuBinario(g)).codigo).toBe(REGRA.EXCESSO);
  });

  test('enunciado com duas linhas completas iguais é recusado', () => {
    const g = vazia();
    g[0] = [0, 1, 0, 1, 1, 0];
    g[5] = [0, 1, 0, 1, 1, 0];
    expect(capturar(() => new SudokuBinario(g)).codigo).toBe(REGRA.REPETIDA);
  });

  test('enunciado com duas colunas completas iguais é recusado, e verificar aponta as duas', () => {
    const g = vazia();
    [0, 1, 0, 1, 1, 0].forEach((v, l) => {
      g[l][0] = v;
      g[l][3] = v;
    });
    expect(verificar(g)).toEqual([
      expect.objectContaining({ regra: REGRA.REPETIDA, eixo: 'coluna', indices: [0, 3] }),
    ]);
    expect(capturar(() => new SudokuBinario(g)).codigo).toBe(REGRA.REPETIDA);
  });

  test('grade com várias regras quebradas lista todas elas', () => {
    const g = vazia();
    g[0] = [1, 1, 1, 1, _, _];
    const regras = verificar(g).map((q) => q.regra);
    expect(regras).toContain(REGRA.EXCESSO);
    expect(regras).toContain(REGRA.TRES_SEGUIDOS);
  });
});

describe('Jogadas', () => {
  test('células do enunciado não podem ser alteradas nem apagadas', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(capturar(() => jogo.jogar(0, 5, 0)).codigo).toBe('FIXA');
    expect(capturar(() => jogo.apagar(0, 5)).codigo).toBe('FIXA');
    expect(jogo.grade[0][5]).toBe(1);
  });

  test.each([2, '1', null, -1, 0.5])('só se joga 0 ou 1 (valor %p é recusado)', (valor) => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(capturar(() => jogo.jogar(0, 0, valor)).codigo).toBe('VALOR');
  });

  test.each([
    [6, 0],
    [0, 6],
    [-1, 0],
    [0, -1],
    [1.5, 0],
    ['0', 0],
  ])('posição (%p, %p) fora da grade é recusada', (l, c) => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(capturar(() => jogo.jogar(l, c, 1)).codigo).toBe('POSICAO');
    expect(capturar(() => jogo.apagar(l, c)).codigo).toBe('POSICAO');
  });

  test('o jogador pode trocar o valor de uma jogada e apagá-la', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 1);
    jogo.jogar(0, 0, 0);
    expect(jogo.grade[0][0]).toBe(0);
    jogo.apagar(0, 0);
    expect(jogo.grade[0][0]).toBeNull();
  });

  test('cada jogada aceita conta, inclusive repetir o mesmo valor', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 0);
    jogo.jogar(0, 0, 0);
    expect(jogo.jogadas).toBe(2);
  });

  test('jogada recusada não altera a grade nem conta como jogada', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 1);
    jogo.jogar(0, 1, 1);
    const antes = copiar(jogo.grade);
    expect(capturar(() => jogo.jogar(0, 2, 1))).not.toBeNull();
    expect(jogo.grade).toEqual(antes);
    expect(jogo.jogadas).toBe(2);
  });

  test('trocar um valor por outro que quebra regra mantém o valor anterior', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 1);
    jogo.jogar(0, 1, 1);
    jogo.jogar(0, 2, 0);
    expect(capturar(() => jogo.jogar(0, 2, 1)).codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(jogo.grade[0][2]).toBe(0);
  });

  test('apagar uma célula já vazia não dá erro', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(() => jogo.apagar(0, 0)).not.toThrow();
  });

  test('apagar não conta como jogada', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 0);
    jogo.apagar(0, 0);
    expect(jogo.jogadas).toBe(1);
  });

  test('na partida com enunciado, trio e célula fixa também são recusados', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(4, 0, 1);
    jogo.jogar(4, 1, 1);
    expect(capturar(() => jogo.jogar(4, 2, 1)).codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(capturar(() => jogo.jogar(2, 1, 0)).codigo).toBe('FIXA');
  });

  test('o número de células vazias acompanha as jogadas', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.vazias).toBe(27);
    jogo.jogar(0, 0, 0);
    expect(jogo.vazias).toBe(26);
    jogo.apagar(0, 0);
    expect(jogo.vazias).toBe(27);
  });
});

describe('Resolução e dica', () => {
  test('o enunciado tem uma única solução, que é a SOLUCAO', () => {
    const solucoes = resolver(ENUNCIADO, 2);
    expect(solucoes).toHaveLength(1);
    expect(solucoes[0]).toEqual(SOLUCAO);
  });

  test('a grade vazia tem mais de uma solução', () => {
    expect(resolver(vazia(), 2)).toHaveLength(2);
  });

  test('o limite de soluções é respeitado', () => {
    expect(resolver(vazia(), 5)).toHaveLength(5);
  });

  test('enunciado sem saída não tem solução', () => {
    const g = vazia();
    g[0] = [0, 0, _, 1, 1, _];
    expect(verificar(g)).toEqual([]);
    expect(resolver(g, 1)).toEqual([]);
  });

  test('grade que já quebra regra não tem solução', () => {
    const g = vazia();
    g[0] = [1, 1, 1, _, _, _];
    expect(resolver(g, 1)).toEqual([]);
  });

  test('a dica mostra o valor certo da primeira célula vazia, sem preenchê-la', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.dica()).toEqual({ linha: 0, coluna: 0, valor: SOLUCAO[0][0] });
    expect(jogo.grade[0][0]).toBeNull();
    expect(jogo.jogadas).toBe(0);
  });

  test('depois de uma jogada certa, a dica passa para a próxima célula vazia', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, SOLUCAO[0][0]);
    expect(jogo.dica()).toMatchObject({ linha: 0, coluna: 1 });
  });

  test('a dica avisa quando as jogadas levaram a um beco sem saída', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 1);
    expect(capturar(() => jogo.dica()).codigo).toBe('SEM_SOLUCAO');
  });

  test('apagar a jogada errada faz a dica voltar a funcionar', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 1);
    jogo.apagar(0, 0);
    expect(jogo.dica().valor).toBe(SOLUCAO[0][0]);
  });
});

describe('Fim da partida', () => {
  test('preencher todas as células sem quebrar regra resolve o jogo', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.estado).toBe('jogando');
    resolverJogando(jogo);
    expect(jogo.vazias).toBe(0);
    expect(jogo.estado).toBe('resolvido');
    expect(jogo.grade).toEqual(SOLUCAO);
    expect(jogo.jogadas).toBe(27);
  });

  test('a partida só termina na última célula, não antes', () => {
    const quase = copiar(SOLUCAO);
    quase[5][5] = null;
    quase[0][0] = null;
    const jogo = new SudokuBinario(quase);
    jogo.jogar(0, 0, SOLUCAO[0][0]);
    expect(jogo.estado).toBe('jogando');
    jogo.jogar(5, 5, SOLUCAO[5][5]);
    expect(jogo.estado).toBe('resolvido');
  });

  test('enunciado já completo e válido começa resolvido', () => {
    const jogo = new SudokuBinario(SOLUCAO);
    expect(jogo.estado).toBe('resolvido');
    expect(jogo.vazias).toBe(0);
  });

  test('depois de resolvido, jogar, apagar e pedir dica são recusados', () => {
    const quase = copiar(SOLUCAO);
    quase[5][5] = null;
    const jogo = new SudokuBinario(quase);
    jogo.jogar(5, 5, SOLUCAO[5][5]);
    expect(capturar(() => jogo.jogar(5, 5, 1)).codigo).toBe('FIM');
    expect(capturar(() => jogo.apagar(5, 5)).codigo).toBe('FIM');
    expect(capturar(() => jogo.dica()).codigo).toBe('FIM');
    expect(jogo.grade[5][5]).toBe(SOLUCAO[5][5]);
  });
});

describe('Mapa em texto e partidas simuladas', () => {
  test('visualizar mostra a grade com "." nas células vazias', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.visualizar().split('\n')).toEqual([
      '. . . . . 1',
      '. . . 0 0 .',
      '. 1 . . . .',
      '0 . 1 . 0 .',
      '. . . . . .',
      '. . 0 0 . .',
    ]);
  });

  test('jogador que segue só as dicas resolve o jogo em 27 jogadas', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    let rodadas = 0;
    while (jogo.estado === 'jogando') {
      const { linha, coluna: col, valor } = jogo.dica();
      jogo.jogar(linha, col, valor);
      rodadas++;
    }
    expect(rodadas).toBe(27);
    expect(jogo.grade).toEqual(SOLUCAO);
  });

  test('jogador erra, tem a jogada recusada, corrige e termina', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 0, 0);

    expect(capturar(() => jogo.jogar(1, 2, 0)).codigo).toBe(REGRA.TRES_SEGUIDOS);
    expect(jogo.grade[1][2]).toBeNull();
    jogo.jogar(1, 2, 1);
    expect(jogo.grade[1]).toEqual([_, _, 1, 0, 0, _]);
    resolverJogando(jogo);
    expect(jogo.estado).toBe('resolvido');
  });

  test('resolver a grade completa pelo solucionador dá uma grade que passa em verificar', () => {
    const [solucao] = resolver(ENUNCIADO, 1);
    expect(verificar(solucao)).toEqual([]);
    expect(solucao.flat().includes(null)).toBe(false);
  });
});
