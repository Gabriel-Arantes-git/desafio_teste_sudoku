const TAMANHO = 6;
const METADE = TAMANHO / 2;

const REGRA = {
  TRES_SEGUIDOS: 'TRES_SEGUIDOS',
  EXCESSO: 'EXCESSO',
  REPETIDA: 'REPETIDA',
};

function erro(codigo, mensagem) {
  const e = new Error(mensagem);
  e.codigo = codigo;
  return e;
}

const copiar = (grade) => grade.map((linha) => [...linha]);
const colunaDe = (grade, c) => grade.map((linha) => linha[c]);

function validarFormato(grade) {
  if (!Array.isArray(grade) || grade.length !== TAMANHO || grade.some((l) => !Array.isArray(l) || l.length !== TAMANHO)) {
    throw erro('FORMATO', `A grade precisa ter ${TAMANHO} x ${TAMANHO} células`);
  }
  if (grade.flat().some((v) => v !== 0 && v !== 1 && v !== null)) {
    throw erro('VALOR', 'Cada célula só aceita 0, 1 ou vazio (null)');
  }
}

function verificar(grade) {
  const quebras = [];
  const eixos = [
    ['linha', grade.map((l) => l)],
    ['coluna', Array.from({ length: TAMANHO }, (_, c) => colunaDe(grade, c))],
  ];

  for (const [eixo, vetores] of eixos) {
    vetores.forEach((v, i) => {
      for (const digito of [0, 1]) {
        if (v.filter((x) => x === digito).length > METADE) {
          quebras.push({ regra: REGRA.EXCESSO, eixo, indices: [i], mensagem: `${eixo} ${i + 1} tem mais de ${METADE} números ${digito}` });
        }
      }
      for (let k = 0; k + 2 < TAMANHO; k++) {
        if (v[k] !== null && v[k] === v[k + 1] && v[k] === v[k + 2]) {
          quebras.push({ regra: REGRA.TRES_SEGUIDOS, eixo, indices: [i], mensagem: `${eixo} ${i + 1} tem três números ${v[k]} seguidos` });
          break;
        }
      }
    });
    for (let a = 0; a < TAMANHO; a++) {
      for (let b = a + 1; b < TAMANHO; b++) {
        const completos = !vetores[a].includes(null) && !vetores[b].includes(null);
        if (completos && vetores[a].join('') === vetores[b].join('')) {
          quebras.push({ regra: REGRA.REPETIDA, eixo, indices: [a, b], mensagem: `${eixo}s ${a + 1} e ${b + 1} são iguais` });
        }
      }
    }
  }
  return quebras;
}

function resolver(grade, limite = 2) {
  validarFormato(grade);
  const trabalho = copiar(grade);
  const solucoes = [];
  if (verificar(trabalho).length > 0) return solucoes;

  const preencher = (pos) => {
    if (solucoes.length >= limite) return;
    if (pos === TAMANHO * TAMANHO) {
      solucoes.push(copiar(trabalho));
      return;
    }
    const l = Math.floor(pos / TAMANHO);
    const c = pos % TAMANHO;
    if (trabalho[l][c] !== null) return preencher(pos + 1);
    for (const valor of [0, 1]) {
      trabalho[l][c] = valor;
      if (verificar(trabalho).length === 0) preencher(pos + 1);
    }
    trabalho[l][c] = null;
  };
  preencher(0);
  return solucoes;
}

class SudokuBinario {
  constructor(enunciado) {
    validarFormato(enunciado);
    const quebras = verificar(enunciado);
    if (quebras.length > 0) {
      const e = erro(quebras[0].regra, `Enunciado inválido: ${quebras[0].mensagem}`);
      throw e;
    }
    this.grade = copiar(enunciado);
    this.fixas = enunciado.map((linha) => linha.map((v) => v !== null));
    this.jogadas = 0;
    this.estado = this.vazias === 0 ? 'resolvido' : 'jogando';
  }

  get vazias() {
    return this.grade.flat().filter((v) => v === null).length;
  }

  jogar(l, c, valor) {
    this._exigirJogavel(l, c);
    if (valor !== 0 && valor !== 1) throw erro('VALOR', 'Só é possível jogar 0 ou 1');
    const anterior = this.grade[l][c];
    this.grade[l][c] = valor;
    const quebras = verificar(this.grade);
    if (quebras.length > 0) {
      this.grade[l][c] = anterior;
      throw erro(quebras[0].regra, `Jogada inválida: ${quebras[0].mensagem}`);
    }
    this.jogadas++;
    if (this.vazias === 0) this.estado = 'resolvido';
  }

  apagar(l, c) {
    this._exigirJogavel(l, c);
    this.grade[l][c] = null;
  }

  dica() {
    if (this.estado !== 'jogando') throw erro('FIM', 'O jogo já terminou');
    const [solucao] = resolver(this.grade, 1);
    if (!solucao) throw erro('SEM_SOLUCAO', 'Não há solução a partir das jogadas atuais; apague alguma jogada');
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        if (this.grade[l][c] === null) return { linha: l, coluna: c, valor: solucao[l][c] };
      }
    }
    return null;
  }

  visualizar() {
    return this.grade.map((linha) => linha.map((v) => (v === null ? '.' : String(v))).join(' ')).join('\n');
  }

  _exigirJogavel(l, c) {
    if (this.estado !== 'jogando') throw erro('FIM', 'O jogo já terminou');
    if (![l, c].every((n) => Number.isInteger(n) && n >= 0 && n < TAMANHO)) {
      throw erro('POSICAO', `Posição fora da grade: (${l}, ${c})`);
    }
    if (this.fixas[l][c]) throw erro('FIXA', 'Célula do enunciado não pode ser alterada');
  }
}

module.exports = { SudokuBinario, verificar, resolver, validarFormato, REGRA, TAMANHO };
